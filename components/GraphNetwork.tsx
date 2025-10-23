'use client';

import { motion } from 'framer-motion';
import ForceGraph2D from 'react-force-graph-2d';

const mockData = {
    nodes: [
        { id: 'You', group: 1 },
        { id: 'Alex', group: 2 },
        { id: 'Nina', group: 2 },
        { id: 'Zayed', group: 3 },
        { id: 'Investor1', group: 4 },
        { id: 'EventX', group: 5 },
    ],
    links: [
        { source: 'You', target: 'Alex' },
        { source: 'You', target: 'Nina' },
        { source: 'Nina', target: 'Zayed' },
        { source: 'Alex', target: 'Investor1' },
        { source: 'Zayed', target: 'EventX' },
    ]
};

export function GraphNetwork() {
    return (
        <motion.div
            className="w-full h-[500px] bg-gray-900 rounded-xl flex items-center justify-center text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <ForceGraph2D
                graphData={mockData}
                nodeLabel="id"
                nodeAutoColorBy="group"
                backgroundColor="#111827"
                linkColor={() => 'rgba(255,255,255,0.2)'}
            />
        </motion.div>
    );
}

export default GraphNetwork;