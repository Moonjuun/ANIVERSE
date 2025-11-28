"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProfile, type UpdateProfileInput } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type { Database } from "@/types/supabase";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

const profileSchema = z.object({
  username: z.string().min(3, "사용자명은 최소 3자 이상이어야 합니다.").max(20, "사용자명은 최대 20자까지 가능합니다.").optional(),
  display_name: z.string().max(50, "표시 이름은 최대 50자까지 가능합니다.").optional(),
  bio: z.string().max(500, "소개는 최대 500자까지 가능합니다.").optional(),
  avatar_url: z.string().url("올바른 URL 형식이 아닙니다.").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: UserProfile;
  onSuccess?: () => void;
}

export function ProfileForm({ profile, onSuccess }: ProfileFormProps) {
  const t = useTranslations("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile.username || "",
      display_name: profile.display_name || "",
      bio: profile.bio || "",
      avatar_url: profile.avatar_url || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);

    try {
      const input: UpdateProfileInput = {
        username: data.username || undefined,
        display_name: data.display_name || undefined,
        bio: data.bio || undefined,
        avatar_url: data.avatar_url || undefined,
      };

      const result = await updateProfile(input);

      if (!result.success) {
        alert(result.error || t("update_error"));
        return;
      }

      onSuccess?.();
    } catch (error) {
      console.error("Profile update error:", error);
      alert(t("unexpected_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 사용자명 */}
      <div>
        <label
          htmlFor="username"
          className="mb-2 block text-sm font-medium text-white"
        >
          {t("username")}
        </label>
        <input
          id="username"
          type="text"
          {...register("username")}
          placeholder={t("username_placeholder")}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.username && (
          <p className="mt-1 text-sm text-rose-500">{errors.username.message}</p>
        )}
      </div>

      {/* 표시 이름 */}
      <div>
        <label
          htmlFor="display_name"
          className="mb-2 block text-sm font-medium text-white"
        >
          {t("display_name")}
        </label>
        <input
          id="display_name"
          type="text"
          {...register("display_name")}
          placeholder={t("display_name_placeholder")}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.display_name && (
          <p className="mt-1 text-sm text-rose-500">
            {errors.display_name.message}
          </p>
        )}
      </div>

      {/* 소개 */}
      <div>
        <label
          htmlFor="bio"
          className="mb-2 block text-sm font-medium text-white"
        >
          {t("bio")}
        </label>
        <textarea
          id="bio"
          rows={4}
          {...register("bio")}
          placeholder={t("bio_placeholder")}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-rose-500">{errors.bio.message}</p>
        )}
      </div>

      {/* 아바타 URL */}
      <div>
        <label
          htmlFor="avatar_url"
          className="mb-2 block text-sm font-medium text-white"
        >
          {t("avatar_url")}
        </label>
        <input
          id="avatar_url"
          type="url"
          {...register("avatar_url")}
          placeholder={t("avatar_url_placeholder")}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.avatar_url && (
          <p className="mt-1 text-sm text-rose-500">
            {errors.avatar_url.message}
          </p>
        )}
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("submitting") : t("update")}
        </Button>
      </div>
    </form>
  );
}

