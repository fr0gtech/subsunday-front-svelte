import ioClient from 'socket.io-client';

import { PUBLIC_SOCKET } from '$env/static/public';

const socket = ioClient(PUBLIC_SOCKET);

export const io = socket;
