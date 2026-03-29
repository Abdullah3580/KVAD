"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { T } from "@/lib/constants";
import { Btn, Skeleton } from "@/components/ui";
import { Stars } from "@/components/ui/Ic";
import Ic from "@/components/ui/Ic";

interface Review {
  id: string; product_id: number;
  user_name: string; user_id: string;
  rating: number; comment: string;
  created_at: string; helpful: number;
}

export default function ReviewSection({ productId }: { productId: number }) {
  const { user }  = useAuth();
  const toast     = useToast();
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [myRating, setMyRating] = useState(5);
  const [comment,  setComment]  = useState("");
  const [submitting, setSub]    = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [hoverR,   setHoverR]   = useState(0);
  const [sortBy,   setSortBy]   = useState<"newest" | "highest" | "lowest">("newest");

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setReviews((data ?? []) as Review[]);
    setLoading(false);
  };

  const submitReview = async () => {
    if (!user) { toast("রিভিউ দিতে লগইন করুন", "warn"); return; }
    if (!comment.trim()) { toast("রিভিউ লিখুন", "warn"); return; }
    setSub(true);
    const { error } = await supabase.from("product_reviews").insert({
      product_id: productId,
      user_id:    user.id,
      user_name:  user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "ব্যবহারকারী",
      rating:     myRating,
      comment:    comment.trim(),
      helpful:    0,
    });
    if (error) {
      if (error.code === "23505") toast("আপনি আগেই রিভিউ দিয়েছেন", "warn");
      else toast("রিভিউ দেওয়া যায়নি", "err");
    } else {
      toast("রিভিউ যোগ হয়েছে! ধন্যবাদ ⭐");
      setComment(""); setMyRating(5); setShowForm(false);
      loadReviews();
    }
    setSub(false);
  };

  const markHelpful = async (id: string, current: number) => {
    await supabase.from("product_reviews").update({ helpful: current + 1 }).eq("id", id);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, helpful: r.helpful + 1 } : r));
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({ r, count: reviews.filter(rv => rv.rating === r).length }));

  const sorted = [...reviews].sort((a, b) => {
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "lowest")  return a.rating - b.rating;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 28 }}>
      <style>{`.playfair{font-family:'Playfair Display',Georgia,serif}.fade-in{animation:fadeIn .3s ease}@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 className="playfair" style={{ fontWeight: 700, fontSize: 22 }}>রিভিউ ও রেটিং</h2>
        <Btn v="outline" sz="sm" onClick={() => setShowForm(f => !f)}>
          <Ic n="star" s={14} /> রিভিউ লিখুন
        </Btn>
      </div>

      {/* Summary */}
      {reviews.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, marginBottom: 28, padding: 20, background: T.raised, borderRadius: 14 }}>
          <div style={{ textAlign: "center" }}>
            <p className="playfair" style={{ fontSize: 52, fontWeight: 900, color: T.gold, lineHeight: 1 }}>{avgRating.toFixed(1)}</p>
            <Stars r={avgRating} s={16} />
            <p style={{ fontSize: 12, color: T.muted, marginTop: 5 }}>{reviews.length} টি রিভিউ</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ratingCounts.map(({ r, count }) => (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: T.muted, minWidth: 14 }}>{r}★</span>
                <div style={{ flex: 1, background: T.border, borderRadius: 3, height: 7, overflow: "hidden" }}>
                  <div style={{ background: T.gold, height: "100%", width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : "0%", borderRadius: 3, transition: "width .5s" }} />
                </div>
                <span style={{ fontSize: 12, color: T.muted, minWidth: 24 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write review form */}
      {showForm && (
        <div className="fade-in" style={{ background: T.raised, borderRadius: 14, padding: 20, marginBottom: 24, border: `1px solid ${T.border}` }}>
          <p className="playfair" style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>আপনার রিভিউ লিখুন</p>

          {/* Star picker */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: T.muted }}>রেটিং:</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n}
                  onMouseEnter={() => setHoverR(n)}
                  onMouseLeave={() => setHoverR(0)}
                  onClick={() => setMyRating(n)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 26, lineHeight: 1, padding: "0 2px", transition: "transform .1s", transform: (hoverR || myRating) >= n ? "scale(1.2)" : "scale(1)" }}>
                  <span style={{ color: (hoverR || myRating) >= n ? T.gold : T.dim }}>★</span>
                </button>
              ))}
            </div>
            <span style={{ fontSize: 13, color: T.gold, fontWeight: 700 }}>
              {["", "খুব খারাপ", "খারাপ", "মোটামুটি", "ভালো", "অসাধারণ!"][hoverR || myRating]}
            </span>
          </div>

          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="পণ্য সম্পর্কে আপনার মতামত লিখুন…"
            rows={4}
            style={{ width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", color: T.champagne, fontSize: 14, fontFamily: "inherit", resize: "vertical", marginBottom: 12 }}
            onFocus={e => (e.target.style.borderColor = T.coral)}
            onBlur={e => (e.target.style.borderColor = T.border)}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <Btn v="coral" loading={submitting} onClick={submitReview}>
              <Ic n="check" s={14} /> জমা দিন
            </Btn>
            <Btn v="ghost" onClick={() => setShowForm(false)}>বাতিল</Btn>
          </div>
          {!user && <p style={{ fontSize: 12, color: T.gold, marginTop: 10 }}>⚠ রিভিউ দিতে লগইন করতে হবে</p>}
        </div>
      )}

      {/* Sort */}
      {reviews.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {([["newest", "নতুন আগে"], ["highest", "সেরা রেটিং"], ["lowest", "কম রেটিং"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => setSortBy(v)}
              style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: sortBy === v ? 700 : 400, fontFamily: "inherit",
                background: sortBy === v ? T.coral : T.raised, color: sortBy === v ? "#000" : T.muted, transition: "all .15s" }}>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2].map(i => <Skeleton key={i} h={90} r={12} />)}
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: T.muted }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>⭐</div>
          <p>এখনো কোনো রিভিউ নেই — প্রথম রিভিউ দিন!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {sorted.map(rv => (
            <div key={rv.id} style={{ padding: 16, background: T.raised, borderRadius: 13, border: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.coral + "33", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: T.coral, flexShrink: 0 }}>
                    {rv.user_name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{rv.user_name}</p>
                    <Stars r={rv.rating} s={12} />
                  </div>
                </div>
                <p style={{ fontSize: 11, color: T.dim }}>{new Date(rv.created_at).toLocaleDateString("bn-BD")}</p>
              </div>
              <p style={{ fontSize: 14, color: T.cream, lineHeight: 1.7, marginBottom: 10 }}>{rv.comment}</p>
              <button onClick={() => markHelpful(rv.id, rv.helpful)}
                style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 20, padding: "4px 12px", cursor: "pointer", fontSize: 12, color: T.muted, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
                👍 সহায়ক ({rv.helpful})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
