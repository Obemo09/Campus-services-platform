import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

const handleEvent = (eventType, data) => {
  switch (eventType) {
    case 'BookingConfirmed':
      console.log(`[notification-service] 📅 BOOKING CONFIRMED`);
      console.log(`  → User: ${data.userName}`);
      console.log(`  → Date: ${data.date} at ${data.startTime}`);
      break;
    case 'EventCreated':
      console.log(`[notification-service] 🎉 NEW EVENT CREATED`);
      console.log(`  → Title: ${data.title}`);
      console.log(`  → Location: ${data.location}`);
      console.log(`  → Organizer: ${data.organizerName}`);
      break;
    case 'RideCreated':
      console.log(`[notification-service] 🚗 NEW RIDE AVAILABLE`);
      console.log(`  → From: ${data.from} → To: ${data.to}`);
      console.log(`  → Driver: ${data.driverName}`);
      break;
    default:
      console.log(`[notification-service] 📬 Event received: ${eventType}`);
  }
};

const startConsumer = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange('campus_events', 'fanout', { durable: false });

    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, 'campus_events', '');

    console.log('[notification-service] Listening for events...');

    channel.consume(q.queue, (msg) => {
      if (msg !== null) {
        const { eventType, data } = JSON.parse(msg.content.toString());
        handleEvent(eventType, data);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('[notification-service] Failed to connect:', error.message);
    setTimeout(startConsumer, 5000);
  }
};

startConsumer();