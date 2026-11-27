'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const roleLabels: Record<string, string> = {
  OWNER: 'ម្ចាស់កម្មវិធី',
  CLERK: 'អ្នកកត់ត្រា',
  ADMIN: 'អ្នកគ្រប់គ្រង',
  ACCOUNTANT: 'គណនេយ្យករ',
};

export function UserNav() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleText = roleLabels[user.role] || user.role;

  return (
    <div className="flex items-center gap-3 font-khmer-heading">
      <div className="hidden sm:flex flex-col text-right">
        <span className="text-xs sm:text-sm font-bold text-[#212E1E]">
          {user.fullName}
        </span>
        <div className="flex justify-end pt-0.5">
          <Badge
            variant="secondary"
            className="text-[10px] font-semibold py-0 px-2 bg-[#EAE3D3] text-[#3E513A] border border-[#D5C7AE]"
          >
            {roleText}
          </Badge>
        </div>
      </div>

      <div className="h-9 w-9 rounded-full bg-[#243521] border border-[#C59F54]/50 flex items-center justify-center text-[#FAF8F3] font-bold text-sm shadow-xs">
        <UserIcon className="h-4.5 w-4.5 text-[#E6C673]" />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={logout}
        title="ចាកចេញពីប្រព័ន្ធ (Logout)"
        className="text-[#6C8068] hover:text-rose-600 hover:bg-rose-50/60 rounded-xl transition-colors cursor-pointer"
      >
        <LogOut className="h-4.5 w-4.5" />
      </Button>
    </div>
  );
}
