import { registerTool } from './registry';

registerTool('send_email', async (args) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    status: 'success',
    recipient: String(args.to ?? ''),
    subject: String(args.subject ?? ''),
    message: "Email sent successfully via SMTP relay.",
    timestamp: new Date().toISOString()
  };
});

registerTool('schedule_meeting', async (args) => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  const participants = Array.isArray(args.participants) ? args.participants : [];
  return {
    status: 'confirmed',
    meetingId: `mtg_${Math.random().toString(36).substr(2, 6)}`,
    title: String(args.title ?? ''),
    time: String(args.date ?? 'Tomorrow 10:00 AM'),
    participants,
    link: 'https://meet.google.com/abc-defg-hij'
  };
});

registerTool('add_to_cart', async (args) => {
  return {
    status: 'added',
    item: String(args.item ?? ''),
    price: args.price,
    cartTotalItems: Math.floor(Math.random() * 5) + 1,
    cartTotalValue: (Math.random() * 200).toFixed(2),
    message: `${String(args.item ?? '')} added to your cart.`
  };
});

registerTool('create_ticket', async (args) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    ticketId: `TKT-${Math.floor(Math.random() * 10000)}`,
    status: 'OPEN',
    title: String(args.title ?? ''),
    priority: String(args.priority ?? 'Medium'),
    category: String(args.category ?? 'General'),
    estimatedResponse: '24 hours'
  };
});

registerTool('book_reservation', async (args) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const guests = typeof args.guests === 'number' ? args.guests : 2;
  return {
    reservationId: `RES-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    status: 'CONFIRMED',
    place: String(args.place ?? ''),
    date: String(args.date ?? 'Tonight'),
    guests,
    message: `Reservation confirmed for ${guests} people at ${String(args.place ?? '')}.`
  };
});
