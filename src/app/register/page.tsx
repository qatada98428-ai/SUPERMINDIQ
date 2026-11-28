"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  UserCheck,
  Lock,
  Mail,
  User,
  Phone,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Globe,
  MapPin,
  Camera,
} from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import {
  COUNTRIES_WITH_GOVERNORATES,
  compressAvatarImage,
  getExtendedProfile,
  saveExtendedProfile,
} from "@/lib/platform-store";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const { language, dir, playFx } = useApp();
  const isEn = language === "en";
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const { signUpWithEmail } = useAuth();

  const [requestedRole, setRequestedRole] = useState<"student" | "trainer">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("العراق");
  const [governorate, setGovernorate] = useState("كربلاء المقدسة");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const governoratesList = COUNTRIES_WITH_GOVERNORATES[country] || ["مدينة أخرى"];

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const list = COUNTRIES_WITH_GOVERNORATES[newCountry] || ["مدينة أخرى"];
    setGovernorate(list[0]);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const compressed = await compressAvatarImage(file);
      setAvatarUrl(compressed);
    } catch {
      setErrorMessage("تعذر رفع الصورة، يرجى اختيار صورة أخرى.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim() || name.trim().length < 3) {
      setErrorMessage(isEn ? "Please enter your full name." : "يرجى إدخال الاسم الثلاثي الحقيقي.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMessage(
        isEn
          ? "Please enter a valid WhatsApp phone number."
          : "يرجى إدخال رقم هاتف صحيح يحتوي على واتساب للتواصل."
      );
      return;
    }
    if (!email.trim()) {
      setErrorMessage(isEn ? "Please enter your email." : "يرجى إدخال البريد الإلكتروني.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage(
        isEn
          ? "Password must be at least 6 characters."
          : "يجب أن تتكون كلمة المرور من 6 خانات على الأقل."
      );
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(isEn ? "Passwords do not match." : "كلمتا المرور غير متطابقتين.");
      return;
    }

    setIsSubmitting(true);
    playFx("click");

    const res = await signUpWithEmail(email, password, name, phone, requestedRole);

    if (!res.success) {
      setIsSubmitting(false);
      setErrorMessage(
        res.error || (isEn ? "Failed to create account." : "تعذر إنشاء الحساب. يرجى التأكد من صحة البيانات.")
      );
      playFx("wrong");
      return;
    }

    // Save Extended Profile with Country, Governorate, Avatar, WhatsApp Phone
    try {
      const supabase = getSupabaseClient();
      const sessionRes = supabase ? await supabase.auth.getSession() : null;
      const userId = sessionRes?.data?.session?.user?.id || `user_${Date.now()}`;

      const baseProf = getExtendedProfile(userId, {
        email: email.trim(),
        name: name.trim(),
        role: requestedRole,
        phone: phone.trim(),
      });

      await saveExtendedProfile({
        ...baseProf,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country,
        governorate,
        avatarUrl: avatarUrl || baseProf.avatarUrl,
        role: requestedRole,
        bio: requestedRole === "trainer" ? bio.trim() : baseProf.bio,
        subscription:
          requestedRole === "trainer"
            ? {
                plan: "free",
                planLabel: "بانتظار تفعيل اشتراك المدرب",
                priceIqd: 0,
                status: "pending",
              }
            : baseProf.subscription,
      });

      // If trainer, also ensure trainer_applications record has country, governorate, photo_url
      if (requestedRole === "trainer" && supabase) {
        try {
          await supabase.from("trainer_applications").insert({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            country,
            governorate,
            bio: bio.trim() || "مدرب حساب ذهني وسوروبان",
            photo_url: avatarUrl || null,
            annual_fee_iqd: 100000,
            status: "pending",
          });
        } catch {}
      }
    } catch (err) {
      console.warn("Extended profile save warning:", err);
    }

    setIsSubmitting(false);

    if (requestedRole === "trainer") {
      setSuccessMessage(
        isEn
          ? "Trainer account created! Redirecting to your Trainer Dashboard..."
          : "تم إنشاء حساب المدرب بنجاح! جاري تحويلك إلى واجهة المدرب الخاصة بك..."
      );
      playFx("fanfare");
      setTimeout(() => {
        router.push("/trainer");
      }, 1200);
    } else {
      setSuccessMessage(
        isEn
          ? "Student account created! Welcome Champion..."
          : "تم إنشاء حساب البطل بنجاح! جاري تحويلك الآن..."
      );
      playFx("fanfare");
      setTimeout(() => {
        let nextPath = "/dashboard";
        try {
          const savedNext = sessionStorage.getItem("supermind_post_login_redirect");
          if (savedNext && savedNext.startsWith("/") && !savedNext.startsWith("//")) {
            nextPath = savedNext;
            sessionStorage.removeItem("supermind_post_login_redirect");
          }
        } catch {}
        router.push(nextPath);
      }, 1200);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <BrandLogo size="lg" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-4">
            {isEn ? "Create Official Account" : "إنشاء حساب رسمي على المنصة"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isEn
              ? "Complete your personal profile to save your real progress and join competitions."
              : "أدخل بياناتك الحقيقية وصورتك الشخصية لحفظ تقدمك الفعلي والمشاركة في المسابقات والواجبات."}
          </p>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-semibold">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-bold">{successMessage}</div>
          </div>
        )}

        <div className="clay-card p-6 sm:p-8 space-y-5">
          {/* Role selector */}
          <div className="grid grid-cols-2 p-1.5 bg-[#F2EFFE] dark:bg-[#242146] rounded-2xl gap-1.5 border border-[#E4DFF9] dark:border-[#38346B]">
            <button
              type="button"
              onClick={() => {
                playFx("toggle");
                setRequestedRole("student");
              }}
              className={`py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                requestedRole === "student"
                  ? "clay-btn-purple !rounded-xl"
                  : "text-[#5E5985] dark:text-[#B3AED6] hover:text-[#1E1B3A]"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{isEn ? "Student Account" : "حساب طالب (بطل)"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playFx("toggle");
                setRequestedRole("trainer");
              }}
              className={`py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                requestedRole === "trainer"
                  ? "clay-btn-mint !rounded-xl"
                  : "text-[#5E5985] dark:text-[#B3AED6] hover:text-[#1E1B3A]"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{isEn ? "Trainer Account" : "حساب مدرب معتمد"}</span>
            </button>
          </div>

          {requestedRole === "trainer" && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed space-y-1">
                <div className="font-black">اعتماد وتوثيق حساب المدرب:</div>
                <p>
                  بعد التسجيل يمكنك تفعيل اشتراك المدرب (شهري 25 ألف / 3 أشهر 50 ألف / سنوي 100 ألف د.ع) عبر التواصل مع إدارة المنصة على الواتساب لتوثيق حسابك ونشر بطاقتك في دليل المدربين وإدارة طلابك.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand-100 dark:bg-slate-700 border-2 border-brand-500 flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-brand-500" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-xs font-black text-slate-900 dark:text-white">
                  الصورة الشخصية (اختياري الآن - يمكنك إضافتها لاحقاً)
                </div>
                <label
                  htmlFor="reg-avatar-upload"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{uploadingPhoto ? "جارٍ الرفع..." : "اختيار صورة شخصية"}</span>
                </label>
                <input
                  id="reg-avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {requestedRole === "trainer" ? "اسم المدرب الثلاثي واللقب" : "اسم الطالب الثلاثي"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User
                  className={`w-4 h-4 text-slate-400 absolute ${
                    dir === "rtl" ? "right-3.5" : "left-3.5"
                  } top-1/2 -translate-y-1/2`}
                />
                <input
                  type="text"
                  required
                  placeholder={
                    requestedRole === "trainer"
                      ? "مثال: الأستاذ أحمد محمد العلي"
                      : "مثال: علي حيدر الزبيدي"
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full ${
                    dir === "rtl" ? "pr-10 pl-3.5" : "pl-10 pr-3.5"
                  } py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none`}
                />
              </div>
            </div>

            {/* Country & Governorate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-brand-600" />
                  <span>اسم الدولة *</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {Object.keys(COUNTRIES_WITH_GOVERNORATES).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>المحافظة / المدينة *</span>
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {governoratesList.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {isEn ? "Phone Number (WhatsApp)" : "رقم الهاتف (يحتوي واتساب)"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone
                  className={`w-4 h-4 text-emerald-500 absolute ${
                    dir === "rtl" ? "right-3.5" : "left-3.5"
                  } top-1/2 -translate-y-1/2`}
                />
                <input
                  type="tel"
                  required
                  dir="ltr"
                  placeholder="0780XXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full ${
                    dir === "rtl" ? "pr-10 pl-3.5" : "pl-10 pr-3.5"
                  } py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-right focus:ring-2 focus:ring-brand-500 focus:outline-none`}
                />
              </div>
            </div>

            {requestedRole === "trainer" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  نبذة تعريفية أو اسم المدرسة/المركز التدريبي
                </label>
                <input
                  type="text"
                  placeholder="مثال: مدرب حساب ذهني وسوروبان - خبرة 5 سنوات"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {isEn ? "Email Address" : "البريد الإلكتروني"} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail
                  className={`w-4 h-4 text-slate-400 absolute ${
                    dir === "rtl" ? "right-3.5" : "left-3.5"
                  } top-1/2 -translate-y-1/2`}
                />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full ${
                    dir === "rtl" ? "pr-10 pl-3.5" : "pl-10 pr-3.5"
                  } py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isEn ? "Password" : "كلمة المرور"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock
                    className={`w-4 h-4 text-slate-400 absolute ${
                      dir === "rtl" ? "right-3.5" : "left-3.5"
                    } top-1/2 -translate-y-1/2`}
                  />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full ${
                      dir === "rtl" ? "pr-10 pl-3.5" : "pl-10 pr-3.5"
                    } py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isEn ? "Confirm Password" : "تأكيد كلمة المرور"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock
                    className={`w-4 h-4 text-slate-400 absolute ${
                      dir === "rtl" ? "right-3.5" : "left-3.5"
                    } top-1/2 -translate-y-1/2`}
                  />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full ${
                      dir === "rtl" ? "pr-10 pl-3.5" : "pl-10 pr-3.5"
                    } py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none`}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-2xl text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 mt-2 ${
                requestedRole === "student"
                  ? "bg-brand-600 hover:bg-brand-500 shadow-brand-500/20"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isEn ? "Creating Account..." : "جاري إنشاء الحساب..."}</span>
                </>
              ) : (
                <>
                  <span>
                    {requestedRole === "student"
                      ? isEn
                        ? "Create Student Account"
                        : "إنشاء حساب الطالب والبدء بالتدريب"
                      : isEn
                      ? "Submit Trainer Account"
                      : "إنشاء حساب المدرب والدخول للوحة المدرب"}
                  </span>
                  <ArrowIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            {isEn ? "Already have an account?" : "لديك حساب بالفعل؟"}{" "}
            <Link href="/login" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
              {isEn ? "Sign in here" : "تسجيل الدخول من هنا"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
