
import React, { useState, useMemo } from 'react';
import DynamicRenderer from '@/components/DynamicRenderer';
import { useTheme } from '@/components/ThemeContext';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';

export const Table = ({ headers, rows, onAction, path }: any) => {
  const { theme } = useTheme();
  
  // --- Local State for Interactive Features ---
  const [filterText, setFilterText] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: number, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // --- Filtering & Sorting Logic ---
  const processedRows = useMemo(() => {
    if (!rows) return [];
    
    let result = [...rows];

    // 1. Filter
    if (filterText) {
      result = result.filter(row => 
        row.some((cell: any) => {
           // Try to extract text from simple cells
           if (typeof cell === 'string') return cell.toLowerCase().includes(filterText.toLowerCase());
           if (typeof cell === 'number') return String(cell).includes(filterText);
           // Simple check for nested text nodes
           if (cell?.text?.content) return cell.text.content.toLowerCase().includes(filterText.toLowerCase());
           if (cell?.badge?.label) return cell.badge.label.toLowerCase().includes(filterText.toLowerCase());
           return false;
        })
      );
    }

    // 2. Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const cellA = a[sortConfig.key];
        const cellB = b[sortConfig.key];
        
        // Extract sortable values
        const valA = typeof cellA === 'object' ? (cellA?.text?.content || cellA?.badge?.label || '') : cellA;
        const valB = typeof cellB === 'object' ? (cellB?.text?.content || cellB?.badge?.label || '') : cellB;

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rows, filterText, sortConfig]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(processedRows.length / rowsPerPage);
  const paginatedRows = processedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSort = (index: number) => {
     let direction: 'asc' | 'desc' = 'asc';
     if (sortConfig && sortConfig.key === index && sortConfig.direction === 'asc') {
       direction = 'desc';
     }
     setSortConfig({ key: index, direction });
  };

  return (
    <div className={theme.table.base}>
      
      {/* 1. Toolbar (Search) */}
      <div className={theme.table.controls}>
         <div className="flex items-center gap-2 text-slate-400">
           <Search className="w-4 h-4" />
           <input 
              type="text" 
              placeholder="Search..." 
              value={filterText}
              onChange={(e) => { setFilterText(e.target.value); setCurrentPage(1); }}
              className={theme.table.searchInput}
           />
         </div>
         <div className="text-xs text-slate-500 font-mono uppercase tracking-wide">
            {processedRows.length} Items
         </div>
      </div>

      {/* 2. Table Body */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className={theme.table.header}>
            <tr>
              {headers?.map((h: string, i: number) => (
                <th 
                  key={i} 
                  className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-white/5 transition-colors group select-none"
                  onClick={() => handleSort(i)}
                >
                  <div className="flex items-center gap-1.5">
                    {h}
                    {sortConfig?.key === i ? (
                       sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-indigo-400" /> : <ChevronDown className="w-3 h-3 text-indigo-400" />
                    ) : (
                       <ChevronsUpDown className="w-3 h-3 opacity-20 group-hover:opacity-50" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {paginatedRows.length > 0 ? (
                paginatedRows.map((row: any[], i: number) => {
                    // We need to map back to original index for 'path' to work correctly with actions? 
                    // Actually for a filtered/sorted view, static pathing can be tricky.
                    // For now, we'll use the visual index for rendering children actions. 
                    // Ideally, rows should have IDs.
                    const visualRowIndex = (currentPage - 1) * rowsPerPage + i;
                    
                    return (
                        <tr key={i} className={theme.table.row}>
                            {row.map((cell: any, j: number) => {
                            const cellPath = path ? `${path}.rows.${visualRowIndex}.${j}` : undefined;
                            return (
                                <td key={j} className={theme.table.cell}>
                                {typeof cell === 'string' || typeof cell === 'number' ? cell : (
                                    <div className="scale-90 origin-left">
                                        <DynamicRenderer node={cell} onAction={onAction} path={cellPath} />
                                    </div>
                                )}
                                </td>
                            );
                            })}
                        </tr>
                    )
                })
            ) : (
                <tr>
                    <td colSpan={headers.length} className="px-6 py-12 text-center text-slate-500 italic">
                        No results found
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Pagination */}
      {totalPages > 1 && (
        <div className={theme.table.pagination.base}>
            <div className="text-xs text-slate-500">
                Page <span className="text-white font-medium">{currentPage}</span> of {totalPages}
            </div>
            <div className="flex gap-1">
                <button 
                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                   disabled={currentPage === 1}
                   className={theme.table.pagination.button}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                   disabled={currentPage === totalPages}
                   className={theme.table.pagination.button}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
