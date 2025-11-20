'use client';

import React from 'react';
import { toast } from 'sonner';

interface ApplyButtonProps {
    job: any;
    onApply?: () => void;
    className?: string;
}

export function ApplyButton({ job, onApply, className = '' }: ApplyButtonProps) {

    const handleApplyClick = () => {
        // Remove sign-in requirement - allow all users to apply
        if (job.posted_by === 'external' && job.job_apply_link) {
            // For external jobs, redirect directly to the application link
            window.open(job.job_apply_link, '_blank');
        } else if (job.posted_by === 'external' && !job.job_apply_link) {
            // External job without application link - show error or fallback
            toast.error('No application link available for this job.');
        } else {
            // For all other jobs (alumni, career_team), proceed with application form
            if (onApply) {
                onApply();
            }
        }
    };

    return (
        <button
            onClick={handleApplyClick}
            className={`px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ${className}`}
        >
            {job.posted_by === 'external' ? 'Apply on Company Site' : 'Apply'}
        </button>
    );
}
