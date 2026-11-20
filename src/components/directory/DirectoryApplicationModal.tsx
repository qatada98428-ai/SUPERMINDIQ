"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Award,
  School,
  User,
  Phone,
  Globe,
  MapPin,
  FileText,
  Camera,
  CheckCircle2,
  Send,
  Building2,
} from "lucide-react";
import {
  COUNTRIES_WITH_GOVERNORATES,
  compressAvatarImage,
  submitTrainerDirectoryCardToCloud,
  submitSchoolDirectoryCardToCloud,
} from "@/lib/platform-store";
import { soundSynth } from "@/lib/audio-synthesizer";

interface DirectoryApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "trainer" | "school";
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
}

export default function DirectoryApplicationModal({
  isOpen,
  onClose,
  defaultType = "trainer",
  defaultName = "",
  defaultEmail = "",
  defaultPhone = "",
}: DirectoryApplicationModalProps) {
  const [appType, setAppType] = useState<"trainer" | "school">(defaultType);
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [country, setCountry] = useState("العراق");
  const [governorate, setGovernorate] = useState("بغداد");
  const [trainerTitle, setTrainerTitle] = useState("مدرب حساب ذهني وسوروبان معتمد");
  const [centerOrSchool, setCenterOrSchool] = useState("");
  const [address, setAddress] = useState("");
  const [curriculumStage, setCurriculumStage] = useState("المستوى التمهيدي والمستوى الأول");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedOk, setSubmittedOk] = useState(false);

  useEffect(() => {
    if (isOpen) {
      soundSynth.playModalSound("open");
      setAppType(defaultType);
      setName(defaultName && defaultName !== "بطل العقل الخارق" ? defaultName : "");
      setPhone(defaultPhone);
      setEmail(defaultEmail);
      setError(null);
      setSubmittedOk(false);
    }
  }, [isOpen, defaultType, defaultName, defaultEmail, defaultPhone]);

  const handleClose = () => {
    soundSynth.playModalSound("close");
    onClose();
  };

  if (!isOpen) return null;

  const governoratesForCountry = COUNTRIES_WITH_GOVERNORATES[country] || ["مدينة أخرى"];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const compressed = await compressAvatarImage(file);
      setPhotoUrl(compressed);
    } catch {
      setError("تعذر معالجة الصورة، يرجى اختيار صورة أخرى.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || name.trim().length < 3) {
      setError("يرجى إدخال الاسم الكامل بشكل صحيح.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setError("يرجى إدخال رقم واتساب للتواصل وتوثيق الطلب.");
      return;
    }

    setSubmitting(true);
    try {
      const result =
        appType === "trainer"
          ? await submitTrainerDirectoryCardToCloud({
              name,
              phone,
              email,
              country,
              governorate,
              trainerTitle,
              centerOrSchool,
              bio,
              photoUrl: photoUrl || undefined,
            })
          : await submitSchoolDirectoryCardToCloud({
              name,
              phone,
              email,
              country,
              governorate,
              address,
              curriculumStage,
              bio,
              logoUrl: photoUrl || undefined,
            });

      if (!result.success) {
        setError(result.error || "حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى.");
        return;
      }
      setSubmittedOk(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        <div className="bg-gradient-to-l from-emerald-700 via-brand-700 to-indigo-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              {appType === "trainer" ? (
                <Award className="w-6 h-6 text-amber-300" />
              ) : (
                <School className="w-6 h-6 text-emerald-300" />
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                {appType === "trainer"
                  ? "أدرج بطاقتك في دليل المدربين المعتمدين"
                  : "أدرج مؤسستك في دليل المدارس المعتمدة"}
              </h2>
              <p className="text-xs text-slate-200">
                أضف معلوماتك وصورتك بسهولة، وستُنشر في الدليل فور موافقة الإدارة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedOk ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              تم إرسال بيانات الدليل بنجاح! 🎉
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              وصل طلبك الآن إلى لوحة مراجعة الإدارة. فور الموافقة عليه واعتماده، ستظهر بطاقتك الرسمية في الدليل العام للمنصة.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="px-8 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-sm shadow-lg"
            >
              حسناً، إغلاق
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
                {error}
              </div>
            )}

            {/* Switch Type */}
            <div className="grid grid-cols-2 gap-2.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setAppType("trainer")}
                className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  appType === "trainer"
                    ? "bg-white dark:bg-slate-900 text-brand-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <Award className="w-4 h-4" />
                <span>بطاقة مدرب معتمد</span>
              </button>
              <button
                type="button"
                onClick={() => setAppType("school")}
                className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  appType === "school"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <School className="w-4 h-4" />
                <span>بطاقة مدرسة / مركز</span>
              </button>
            </div>

            {/* Photo / Logo */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-100 dark:bg-slate-700 border-2 border-brand-500 shrink-0 flex items-center justify-center">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="Card Preview" className="w-full h-full object-cover" />
                ) : appType === "trainer" ? (
                  <User className="w-8 h-8 text-brand-500" />
                ) : (
                  <Building2 className="w-8 h-8 text-emerald-500" />
                )}
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-black text-slate-900 dark:text-white">
                  {appType === "trainer" ? "الصورة الشخصية للمدرب" : "شعار المدرسة أو صورة غلاف المنهج"}
                </div>
                <label
                  htmlFor="dir-photo-upload"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{uploading ? "جارٍ المعالجة..." : "رفع صورة"}</span>
                </label>
                <input
                  id="dir-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-600" />
                  <span>{appType === "trainer" ? "الاسم الكامل للمدرب *" : "اسم المدرسة أو المركز *"}</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={appType === "trainer" ? "مثال: الأستاذ علي حسن" : "مثال: مدرسة النخبة الأهلية"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>رقم الهاتف (واتساب) *</span>
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0780XXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold text-right"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-brand-600" />
                  <span>الدولة *</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => {
                    const c = e.target.value;
                    setCountry(c);
                    setGovernorate(COUNTRIES_WITH_GOVERNORATES[c]?.[0] || "مدينة أخرى");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                >
                  {Object.keys(COUNTRIES_WITH_GOVERNORATES).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>المحافظة / المدينة *</span>
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                >
                  {governoratesForCountry.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {appType === "trainer" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    اللقب التدريبي / الاختصاص
                  </label>
                  <input
                    type="text"
                    value={trainerTitle}
                    onChange={(e) => setTrainerTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    المركز أو المدرسة (إن وجد)
                  </label>
                  <input
                    type="text"
                    value={centerOrSchool}
                    onChange={(e) => setCenterOrSchool(e.target.value)}
                    placeholder="اختياري"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    العنوان التفصيلي للمدرسة
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="مثال: حي الحسين - قرب..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    المراحل / المنهج المعتمد
                  </label>
                  <input
                    type="text"
                    value={curriculumStage}
                    onChange={(e) => setCurriculumStage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand-600" />
                <span>نبذة تعريفية قصيرة تظهر للجمهور في الدليل</span>
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="اكتب نبذة مختصرة عن الخبرة أو البرامج التدريبية..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-l from-emerald-600 to-brand-600 hover:from-emerald-700 hover:to-brand-700 text-white text-xs sm:text-sm font-black shadow-lg flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? "جارٍ الإرسال..." : "إرسال البطاقة لمراجعة الإدارة"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
