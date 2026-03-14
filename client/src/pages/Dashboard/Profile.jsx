import React, { useEffect, useState } from "react";
import API from "../../api";
import { User, Mail, Shield } from "lucide-react";
import Skeleton from "../../components/Skeleton";
import SkillBadges from "../../components/SkillBadges";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await API.get("/protected");
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center mt-20">
        <Skeleton width="w-24" height="h-24" rounded="rounded-full" />
        <Skeleton width="w-48" height="h-6" className="mt-4" />
        <Skeleton width="w-64" height="h-4" className="mt-2" />
        <Skeleton width="w-32" height="h-4" className="mt-2" />
      </div>
    );

  if (!user)
    return (
      <p className="text-center text-red-500 mt-20 animate-fadeIn">
        Failed to load profile. Please refresh.
      </p>
    );

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 dark:text-slate-200 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 text-gray-800 animate-fadeIn">
      
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-4xl font-bold shadow-md">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <h2 className="text-2xl font-bold mt-3 text-center">{user.name}</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors shadow-sm">
          <User className="text-blue-600 dark:text-blue-300" size={20} />
          <p className="text-sm"><strong>Name:</strong> {user.name}</p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors shadow-sm break-all">
          <Mail className="text-blue-600 dark:text-blue-300" size={20} />
          <p className="text-sm"><strong>Email:</strong> {user.email}</p>
        </div>

        {user.skills?.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Skills:</h4>
            <SkillBadges skills={user.skills} />
          </div>
        )}
      </div>
    </div>
  );
}
