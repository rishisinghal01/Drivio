import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Ride request channel (User books -> emits 'rideRequested', Partners listen for 'newRideRequest')
    socket.on('rideRequested', (data) => {
      console.log('Ride requested:', data);
      socket.broadcast.emit('newRideRequest', data);
    });

    // Ride status channel (Partner accepts -> emits 'rideStatusUpdated', Users listen for 'rideUpdated')
    socket.on('rideStatusUpdated', (data) => {
      console.log('Ride status updated:', data);
      socket.broadcast.emit('rideUpdated', data);
    });

    // Live tracking channel (Partner simulator -> emits 'driverLocationUpdate', Users listen for it)
    socket.on('driverLocationUpdate', (data) => {
      socket.broadcast.emit('driverLocationUpdate', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
