import { Suspense } from 'react';
import FriendProfClient from './FriendProfClient';

export default function FriendProfPage() {
    return (
        <Suspense fallback={<div>Loading profile...</div>}>
            <FriendProfClient />
        </Suspense>

    );


}
