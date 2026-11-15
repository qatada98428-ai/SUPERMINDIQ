"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Camera,
  User,
  Phone,
  Globe,
  MapPin,
  GraduationCap,
  Award,
  CheckCircle2,
  Sparkles,
  Building2,
  FileText,
} from "lucide-react";
import {
  ExtendedUserProfile,
  COUNTRIES_WITH_GOVERNORATES,
  compressAvatarImage,
  saveExtendedProfile,
  getVerifiedTrainersForDirectory,
} from "@/lib/platform-store";

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ExtendedUserProfile;
  onSaved: (updated: ExtendedUserProfile) => void;
  forceRole?: "student" | "trainer";
}

export default function ProfileEditorModal({
  isOpen,
  onClose,
  profile,
  onSaved,
  forceRole,
}: ProfileEditorModalProps) {
  const effectiveRole = forceRole || profile.role;
  const isTrainer = effectiveRole === "trainer" || effectiveRole === "admin";

  const [name, setName] = useState(profile.name === "بطل العقل الخارق" ? "" : profile.name);
  const [phone, setPhone] = useState(profile.phone || "");
  const [country, setCountry] = useState(profile.country || "العراق");
  const [governorate, setGovernorate] = useState(profile.governorate || "كربلاء المقدسة");
  const [customGovernorate, setCustomGovernorate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
  const [ageOrGrade, setAgeOrGrade] = useState(profile.ageOrGrade || "");
  const [trainerId, setTrainerId] = useState(profile.trainerId || "trainer-qatada");

  // Trainer extra fields
  const [trainerTitle, setTrainerTitle] = useState(
    profile.trainerTitle || "مدرب حساب ذهني معتمد"
  );
  const [experienceYears, setExperienceYears] = useState(
    String(profile.experienceYears || 3)
  );
  const [centerOrSchool, setCenterOrSchool] = useState(profile.centerOrSchool || "");
  const [bio, setBio] = useState(profile.bio || "");

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableTrainers = getVerifiedTrainersForDirectory();
  const governoratesForCountry = COUNTRIES_WITH_GOVERNORATES[country] || ["مدينة أخرى"];

  useEffect(() => {
    if (isOpen) {
      setName(profile.name === "بطل العقل الخارق" ? "" : profile.name);
      setPhone(profile.phone || "");
      setCountry(profile.country || "العراق");
      setGovernorate(
        profile.governorate ||
          (COUNTRIES_WITH_GOVERNORATES[profile.country || "العراق"]?.[0] ?? "كربلاء المقدسة")
      );
      setAvatarUrl(profile.avatarUrl || "");
      setAgeOrGrade(profile.ageOrGrade || "");
      setTrainerId(profile.trainerId || "trainer-qatada");
      setTrainerTitle(profile.trainerTitle || "مدرب حساب ذهني معتمد");
      setExperienceYears(String(profile.experienceYears || 3));
      setCenterOrSchool(profile.centerOrSchool || "");
      setBio(profile.bio || "");
      setError(null);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setError(null);
    try {
      const compressed = await compressAvatarImage(file);
      setAvatarUrl(compressed);
    } catch {
      setError("تعذر معالجة الصورة، يرجى اختيار صورة أخرى.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const list = COUNTRIES_WITH_GOVERNORATES[newCountry] || ["مدينة أخرى"];
    setGovernorate(list[0]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 3) {
      setError("يرجى كتابة الاسم الثلاثي الحقيقي بشكل صحيح.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setError("يرجى إدخال رقم هاتف يحتوي على واتساب للتواصل وتوثيق الحساب.");
      return;
    }
    const finalGov =
      governorate === "أخرى" || governorate === "مدينة أخرى"
        ? customGovernorate.trim() || governorate
        : governorate;

    if (!country || !finalGov) {
      setError("يرجى اختيار الدولة والمحافظة.");
      return;
    }

    setSaving(true);
    try {
      const selectedTrainerObj = availableTrainers.find((t) => t.id === trainerId);
      const updated: ExtendedUserProfile = {
        ...profile,
        name: name.trim(),
        phone: phone.trim(),
        country,
        governorate: finalGov,
        avatarUrl: avatarUrl || profile.avatarUrl,
        ageOrGrade: ageOrGrade.trim(),
        trainerId: isTrainer ? profile.id : trainerId,
        trainerName: isTrainer
          ? name.trim()
          : selectedTrainerObj?.name || "الأستاذ قتادة كريم",
        trainerTitle: isTrainer ? trainerTitle.trim() : profile.trainerTitle,
        experienceYears: isTrainer ? Number(experienceYears) || 1 : profile.experienceYears,
        centerOrSchool: isTrainer ? centerOrSchool.trim() : profile.centerOrSchool,
        bio: isTrainer ? bio.trim() : profile.bio,
      };

      const saved = await saveExtendedProfile(updated);
      onSaved(saved);
      onClose();
    } catch {
      setError("حدث خطأ أثناء حفظ البيانات. حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="bg-gradient-to-l from-brand-700 via-brand-600 to-indigo-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                {isTrainer
                  ? "البروفايل الرسمي للمدرب وتوثيق البيانات"
                  : "البروفايل الشخصي لبطل العقل الخارق"}
              </h2>
              <p className="text-xs text-slate-200">
                أكمل معلوماتك وصورتك ورقم الواتساب ليتم حفظ تقدمك الحقيقي وتوثيق حسابك
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Avatar Upload Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-brand-100 dark:bg-slate-700 border-2 border-brand-500 shadow-md shrink-0 flex items-center justify-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={name || "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-brand-500" />
              )}
              <label
                htmlFor="avatar-upload-input"
                className="absolute inset-0 bg-slate-950/45 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span>تغيير الصورة</span>
              </label>
            </div>

            <div className="space-y-2 text-center sm:text-right flex-1">
              <div className="text-sm font-black text-slate-900 dark:text-white">
                الصورة الشخصية {isTrainer ? "(تظهر في دليل المدربين المعتمدين)" : "(تظهر في بروفايل البطل ولوحة الشرف)"}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اختر صورة واضحة من هاتفك أو حاسوبك (يتم ضغطها وتحسينها تلقائياً).
              </p>
              <div>
                <label
                  htmlFor="avatar-upload-input"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>{uploadingPhoto ? "جارٍ المعالجة..." : "رفع صورة شخصية"}</span>
                </label>
                <input
                  id="avatar-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Core Personal Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-600" />
                <span>{isTrainer ? "الاسم الكامل للمدرب *" : "اسم الطالب الثلاثي *"}</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isTrainer ? "مثال: الأستاذ أحمد محمد علي" : "مثال: علي حسين كاظم"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* WhatsApp Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>رقم الهاتف (يحتوي واتساب) *</span>
              </label>
              <input
                type="tel"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0780XXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
              />
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-brand-600" />
                <span>اسم الدولة *</span>
              </label>
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {Object.keys(COUNTRIES_WITH_GOVERNORATES).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Governorate */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>المحافظة / المدينة *</span>
              </label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {governoratesForCountry.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(governorate === "أخرى" || governorate === "مدينة أخرى") && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                اكتب اسم المحافظة أو المدينة:
              </label>
              <input
                type="text"
                value={customGovernorate}
                onChange={(e) => setCustomGovernorate(e.target.value)}
                placeholder="اكتب اسم مدينتك هنا..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Student Specific Fields */}
          {!isTrainer && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                  <span>العمر أو المرحلة الدراسية</span>
                </label>
                <input
                  type="text"
                  value={ageOrGrade}
                  onChange={(e) => setAgeOrGrade(e.target.value)}
                  placeholder="مثال: 9 سنوات - الصف الرابع الابتدائي"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-brand-600" />
                  <span>المدرب المشرف عليك (لاستلام الواجبات)</span>
                </label>
                <select
                  value={trainerId}
                  onChange={(e) => setTrainerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                >
                  {availableTrainers.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.name} ({tr.governorate || "العراق"})
                    </option>
                  ))}
                  <option value="self-study">تدريب حر مباشر على المنصة</option>
                </select>
              </div>
            </div>
          )}

          {/* Trainer Specific Fields */}
          {isTrainer && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>اللقب التدريبي / الاختصاص</span>
                  </label>
                  <input
                    type="text"
                    value={trainerTitle}
                    onChange={(e) => setTrainerTitle(e.target.value)}
                    placeholder="مثال: مدرب حساب ذهني وفلاش أنزان معتمد"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>المدرسة أو المركز التدريبي</span>
                  </label>
                  <input
                    type="text"
                    value={centerOrSchool}
                    onChange={(e) => setCenterOrSchool(e.target.value)}
                    placeholder="مثال: مدرسة براعم كربلاء / مركز الإبداع"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-600" />
                  <span>نبذة تعريفية عن المدرب (تظهر للطلاب والأهالي في الدليل)</span>
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="اكتب نبذة مختصرة عن خبراتك في تدريب الحساب الذهني والسوروبان..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              إغلاق مؤقتاً
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? "جارٍ الحفظ..." : "حفظ المعلومات وتوثيق البروفايل"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
