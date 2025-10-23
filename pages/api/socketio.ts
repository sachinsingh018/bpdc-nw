import { NextApiRequest, NextApiResponse } from 'next';
import { initSocket, SocketWithIO, NextApiResponseWithSocket } from '@/lib/socket';

export default function handler(req: SocketWithIO, res: NextApiResponseWithSocket) {
    initSocket(req, res);
}

export const config = {
    api: {
        bodyParser: false,
    },
}; 