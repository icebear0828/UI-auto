import { registerTool } from './registry';

registerTool('send_email', async (args) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    status: 'success',
    recipient: args.to,
    subject: args.subject,
    message: "Email sent successfully via SMTP relay.",
    timestamp: new Date().toISOString()
  };
});

registerTool('schedule_meeting', async (args) => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  return {
    status: 'confirmed',
    meetingId: `mtg_${Math.random().toString(36).substr(2, 6)}`,
    title: args.title,
    time: args.date || 'Tomorrow 10:00 AM',
    participants: args.participants || [],
    link: 'https://meet.google.com/abc-defg-hij'
  };
});

registerTool('add_to_cart', async (args) => {
  return {
    status: 'added',
    item: args.item,
    price: args.price,
    cartTotalItems: Math.floor(Math.random() * 5) + 1,
    cartTotalValue: (Math.random() * 200).toFixed(2),
    message: `${args.item} added to your cart.`
  };
});

registerTool('create_ticket', async (args) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    ticketId: `TKT-${Math.floor(Math.random() * 10000)}`,
    status: 'OPEN',
    title: args.title,
    priority: args.priority || 'Medium',
    category: args.category || 'General',
    estimatedResponse: '24 hours'
  };
});

registerTool('book_reservation', async (args) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    reservationId: `RES-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    status: 'CONFIRMED',
    place: args.place,
    date: args.date || 'Tonight',
    guests: args.guests || 2,
    message: `Reservation confirmed for ${args.guests || 2} people at ${args.place}.`
  };
});
