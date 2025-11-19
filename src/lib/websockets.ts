import ioClient from 'socket.io-client';
const ENDPOINT = process.env.SOCKET;

const socket = ioClient(ENDPOINT);

export const io = socket;
