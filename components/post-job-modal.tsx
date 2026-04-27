import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { X } from 'lucide-react';

export type RecruiterPostJobFormData = {
  job_title: string;
  employer_name: string;
  job_description: string;
  job_city: string;
  job_state: string;
  job_country: string;
  job_employment_type: string;
  job_min_salary: string;
  job_max_salary: string;
  job_salary_period: string;
  job_is_remote: boolean;
  job_apply_link: string;
};

export function PostJobModal({
  onClose,
  onSubmit,
  loading,
}: {
  onClose: () => void;
  onSubmit: (jobData: RecruiterPostJobFormData) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<RecruiterPostJobFormData>({
    job_title: '',
    employer_name: '',
    job_description: '',
    job_city: '',
    job_state: '',
    job_country: '',
    job_employment_type: 'full-time',
    job_min_salary: '',
    job_max_salary: '',
    job_salary_period: 'yearly',
    job_is_remote: false,
    job_apply_link: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.job_title || !formData.employer_name || !formData.job_description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.job_min_salary && isNaN(Number(formData.job_min_salary))) {
      toast.error('Minimum salary must be a valid number');
      return;
    }

    if (formData.job_max_salary && isNaN(Number(formData.job_max_salary))) {
      toast.error('Maximum salary must be a valid number');
      return;
    }

    if (formData.job_min_salary && formData.job_max_salary) {
      if (Number(formData.job_min_salary) > Number(formData.job_max_salary)) {
        toast.error('Minimum salary cannot be greater than maximum salary');
        return;
      }
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white text-black dark:bg-slate-800 dark:text-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-black/10 dark:border-white/10 shadow-2xl shadow-blue-500/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <span className="text-black font-bold">+</span>
            </div>
            <h2 className="text-2xl font-bold text-black dark:text-white">Post New Job</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-black dark:text-white hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          >
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">Job Title *</label>
              <Input
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                required
                className="bg-white border-black/10 dark:bg-slate-900/40 dark:border-white/10 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">Company Name *</label>
              <Input
                value={formData.employer_name}
                onChange={(e) => setFormData({ ...formData, employer_name: e.target.value })}
                required
                className="bg-white border-black/10 dark:bg-slate-900/40 dark:border-white/10 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black dark:text-white">Job Description *</label>
            <Textarea
              value={formData.job_description}
              onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
              rows={4}
              required
              className="bg-white border-black/10 dark:bg-slate-900/40 dark:border-white/10 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">City</label>
              <Input
                value={formData.job_city}
                onChange={(e) => setFormData({ ...formData, job_city: e.target.value })}
                className="bg-white border-black/10 dark:bg-slate-900/40 dark:border-white/10 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">State</label>
              <Input
                value={formData.job_state}
                onChange={(e) => setFormData({ ...formData, job_state: e.target.value })}
                className="bg-white border-black/10 dark:bg-slate-900/40 dark:border-white/10 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">Country</label>
              <Input
                value={formData.job_country}
                onChange={(e) => setFormData({ ...formData, job_country: e.target.value })}
                className="bg-white border-black/10 dark:bg-slate-900/40 dark:border-white/10 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">Employment Type</label>
              <Select
                value={formData.job_employment_type}
                onValueChange={(value) => setFormData({ ...formData, job_employment_type: value })}
              >
                <SelectTrigger className="bg-white border-black/10 dark:bg-slate-900/40 dark:border-white/10 text-black dark:text-white">
                  <SelectValue className="text-black dark:text-white" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-slate-800 border-white/20">
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">Salary Period</label>
              <Select
                value={formData.job_salary_period}
                onValueChange={(value) => setFormData({ ...formData, job_salary_period: value })}
              >
                <SelectTrigger className="bg-white border-black/10 dark:bg-slate-900/40 dark:border-white/10 text-black dark:text-white">
                  <SelectValue className="text-black dark:text-white" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-slate-800 border-white/20">
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">Min Salary</label>
              <Input
                type="number"
                value={formData.job_min_salary}
                onChange={(e) => setFormData({ ...formData, job_min_salary: e.target.value })}
                placeholder="50000"
                min="0"
                className="bg-white border-black/10 dark:bg-slate-900/40 dark:border-white/10 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">Max Salary</label>
              <Input
                type="number"
                value={formData.job_max_salary}
                onChange={(e) => setFormData({ ...formData, job_max_salary: e.target.value })}
                placeholder="80000"
                min="0"
                className="bg-white border-black/10 dark:bg-slate-900/40 dark:border-white/10 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black dark:text-white">Application Link (Optional)</label>
            <Input
              type="url"
              value={formData.job_apply_link}
              onChange={(e) => setFormData({ ...formData, job_apply_link: e.target.value })}
              placeholder="https://... (optional)"
              className="bg-white border-black/10 dark:bg-slate-900/40 dark:border-white/10 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remote"
              checked={formData.job_is_remote}
              onChange={(e) => setFormData({ ...formData, job_is_remote: e.target.checked })}
              className="rounded border-white/20"
            />
            <label htmlFor="remote" className="text-sm font-medium text-black dark:text-white">
              Remote position
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="text-black dark:text-white border-black/20 dark:border-white/20 bg-transparent hover:bg-black/5 dark:hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-black border-0"
            >
              {loading ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

