import amqp from 'amqplib';

let channel = null;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange('campus_events', 'fanout', { durable: false });
    console.log('[events-service] Connected to RabbitMQ.');
  } catch (error) {
    console.error('[events-service] RabbitMQ connection failed:', error.message);
  }
};

export const publishEvent = (eventType, data) => {
  if (!channel) return;
  const message = JSON.stringify({ eventType, data, timestamp: new Date() });
  channel.publish('campus_events', '', Buffer.from(message));
  console.log(`[events-service] Published event: ${eventType}`);
};