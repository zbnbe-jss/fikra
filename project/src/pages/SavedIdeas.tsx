import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/language";
import { getSavedIdeas } from "../lib/myIdea";
import IdeaCard from "../components/IdeaCard";
import { FadeIn, Stagger, StaggerItem } from "../components/motion";

export default function SavedIdeas() {
  const { t } = useLang();
  const navigate = useNavigate();
  const saved = getSavedIdeas();

  return (
    <div className="min-h-screen bg-ink-50 pt-20">
      <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <FadeIn>
      <h1 className="mb-2 text-3xl font-bold text-ink-900">{t("الأفكار المحفوظة", "Saved Ideas")}</h1>
      <p className="mb-8 text-ink-500">
        {t("الأفكار اللي حفظتها عشان ترجع لها لاحقاً", "Ideas you've saved to consider later")}
      </p>
      </FadeIn>

      {saved.length === 0 ? (
        <FadeIn className="rounded-2xl border border-dashed border-ink-200 py-16 text-center">
          <p className="mb-6 text-ink-500">{t("ما حفظت أي فكرة بعد", "You haven't saved any ideas yet")}</p>
          <button
            onClick={() => navigate("/explore")}
            className="btn-primary"
          >
            {t("استكشف الأفكار", "Explore Ideas")}
          </button>
        </FadeIn>
      ) : (
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((idea) => (
            <StaggerItem key={idea.id}>
              <IdeaCard idea={idea} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
    </div>
  );
}
