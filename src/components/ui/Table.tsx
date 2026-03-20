
import React, { useState, useMemo, useCallback } from 'react';
import DynamicRenderer from '@/components/DynamicRenderer';
import { useTheme } from '@/components/ThemeContext';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsUpDown, Download, CheckSquare, Square } from 'lucide-react';
import type { TableProps, TableCell } from '@/services/schemas';
import type { RendererInjectedProps } from '@/types';

export const Table = ({ headers, rows, onAction, path }: TableProps & RendererInjectedProps) => {
  const { theme } = useTheme();

  // --- Local State for Interactive Features ---
  const [filterText, setFilterText] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: number, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const rowsPerPage = 5;

  // --- Row Selection ---
  const toggleRow = useCallback((idx: number) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (!rows) return;
    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map((_: unknown, i: number) => i)));
    }
  }, [rows, selectedRows.size]);

  // --- CSV Export ---
  const handleExportCsv = useCallback(() => {
    if (!headers || !rows) return;
    const extractText = (cell: unknown): string => {
      if (typeof cell === 'string' || typeof cell === 'number') return String(cell);
      if (cell && typeof cell === 'object') {
        const obj = cell as Record<string, unknown>;
        if (obj.text && typeof obj.text === 'object') return String((obj.text as Record<string, unknown>).content ?? '');
        if (obj.badge && typeof obj.badge === 'object') return String((obj.badge as Record<string, unknown>).label ?? '');
      }
      return '';
    };
    const exportRows = selectedRows.size > 0
      ? rows.filter((_: unknown, i: number) => selectedRows.has(i))
      : rows;
    const csv = [
      headers.join(','),
      ...exportRows.map((row: unknown[]) => row.map((cell: unknown) => `"${extractText(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [headers, rows, selectedRows]);

  // --- Filtering & Sorting Logic ---
  const processedRows = useMemo(() => {
    if (!rows) return [];
    
    let result = [...rows];

    // 1. Filter
    if (filterText) {
      result = result.filter(row => 
        row.some((cell: TableCell) => {
           // Try to extract text from simple cells
           if (typeof cell === 'string') return cell.toLowerCase().includes(filterText.toLowerCase());
           if (typeof cell === 'number') return String(cell).includes(filterText);
           // Simple check for nested text nodes
           if (cell && typeof cell === 'object') {
             const obj = cell as Record<string, unknown>;
             const text = obj.text as Record<string, unknown> | undefined;
             const badge = obj.badge as Record<string, unknown> | undefined;
             if (typeof text?.content === 'string') return text.content.toLowerCase().includes(filterText.toLowerCase());
             if (typeof badge?.label === 'string') return badge.label.toLowerCase().includes(filterText.toLowerCase());
           }
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
        const extractSort = (c: TableCell): string | number => {
          if (c && typeof c === 'object') {
            const obj = c as Record<string, unknown>;
            const text = obj.text as Record<string, unknown> | undefined;
            const badge = obj.badge as Record<string, unknown> | undefined;
            return (typeof text?.content === 'string' ? text.content : undefined) || (typeof badge?.label === 'string' ? badge.label : undefined) || '';
          }
          if (typeof c === 'string' || typeof c === 'number') return c;
          return '';
        };
        const valA = extractSort(cellA);
        const valB = extractSort(cellB);

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
         <div className="flex items-center gap-3">
            {selectedRows.size > 0 && (
              <span className="text-xs text-indigo-400 font-mono">{selectedRows.size} selected</span>
            )}
            <button onClick={handleExportCsv} className="p-1 rounded text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-colors" title={selectedRows.size > 0 ? `Export ${selectedRows.size} rows` : 'Export all'}>
              <Download className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-slate-500 font-mono uppercase tracking-wide">
              {processedRows.length} Items
            </span>
         </div>
      </div>

      {/* 2. Table Body */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className={theme.table.header}>
            <tr>
              <th className="px-3 py-4 w-8">
                <button onClick={toggleAll} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                  {rows && selectedRows.size === rows.length ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4" />}
                </button>
              </th>
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
                paginatedRows.map((row: TableCell[], i: number) => {
                    // We need to map back to original index for 'path' to work correctly with actions? 
                    // Actually for a filtered/sorted view, static pathing can be tricky.
                    // For now, we'll use the visual index for rendering children actions. 
                    // Ideally, rows should have IDs.
                    const visualRowIndex = (currentPage - 1) * rowsPerPage + i;
                    
                    return (
                        <tr key={i} className={`${theme.table.row} ${selectedRows.has(visualRowIndex) ? 'bg-indigo-500/10' : ''}`}>
                            <td className="px-3 py-3 w-8">
                              <button onClick={() => toggleRow(visualRowIndex)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                                {selectedRows.has(visualRowIndex) ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4" />}
                              </button>
                            </td>
                            {row.map((cell: TableCell, j: number) => {
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
                    <td colSpan={(headers?.length ?? 0) + 1} className="px-6 py-12 text-center text-slate-500 italic">
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
