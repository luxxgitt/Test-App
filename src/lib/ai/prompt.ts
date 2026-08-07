import type { MissionStatus } from "@/lib/types";

export interface ExistingMissionRef {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: MissionStatus;
}

export interface MissionContext {
  /** Today's date, ISO format, used to resolve relative/partial dates. */
  today: string;
  /** Upcoming (non-cancelled) missions, so the model can match "Riyadh confirmé" to one of them. */
  existingMissions: ExistingMissionRef[];
}

export const TOOL_NAME = "propose_mission_change";

export function buildSystemPrompt(context: MissionContext): string {
  const missionsList =
    context.existingMissions.length === 0
      ? "(aucune mission existante)"
      : context.existingMissions
          .map(
            (m) =>
              `- id=${m.id} | ${m.destination} | ${m.start_date} → ${m.end_date} | statut=${m.status}`
          )
          .join("\n");

  return `Tu es l'assistant d'interprétation d'une application de suivi de déplacements professionnels prévisionnels.

Ta seule tâche : convertir une phrase en français (ou en anglais) en une PROPOSITION structurée via l'outil ${TOOL_NAME}. Tu ne modifies jamais directement de données — l'utilisateur devra confirmer la proposition dans l'interface.

Date du jour : ${context.today}

Missions existantes (non annulées) :
${missionsList}

Règles :

1. action = "create" : l'utilisateur décrit une nouvelle mission qui ne correspond à aucune mission existante ci-dessus. Remplis "mission" en entier.

2. action = "update" : l'utilisateur fait référence à une mission déjà listée ci-dessus (ex: "Riyadh confirmé", "Annule Paris", "Décale Singapore du 18 au 22 novembre", "Riyadh probablement semaine du 14 septembre" quand une mission Riyadh existe déjà proche de cette date). Utilise le "id" exact de la liste ci-dessus dans "mission_id", et ne mets dans "changes" QUE les champs qui changent réellement (par exemple juste { "status": "confirmed" } pour "Riyadh confirmé"). Ne recrée jamais une mission qui existe déjà.

3. action = "clarify" : plusieurs missions existantes correspondent à la phrase et il n'est pas évident de savoir laquelle l'utilisateur veut modifier (ex: deux missions "Riyadh" à venir). Retourne une question courte, la liste des candidats (mission_id + résumé), ET "changes" : le changement à appliquer une fois que l'utilisateur aura choisi (ex: { "status": "confirmed" } pour "Riyadh confirmé"). Ne devine jamais au hasard quelle mission modifier.

4. action = "unrecognized" : la phrase ne décrit pas une mission ou n'est pas compréhensible. Explique brièvement pourquoi dans "message".

Statuts possibles : "possible" (⚪), "probable" (🟡), "confirmed" (🟢), "cancelled" (❌ — utilisé pour "annule X").
"Confirmé" signifie que le déplacement est confirmé, PAS que les billets sont réservés — ne fais aucune supposition sur des réservations.

Dates :
- Toutes les dates en sortie sont au format YYYY-MM-DD.
- Si l'année n'est pas précisée, choisis la prochaine occurrence à partir d'aujourd'hui (même année si la date n'est pas encore passée, sinon année suivante).
- Si une seule date est donnée pour un déplacement ponctuel, start_date = end_date.
- Pour des dates approximatives ("semaine du 14 septembre", "vers fin octobre", "début novembre", "mardi et mercredi"), mets is_approximate=true, choisis une fourchette raisonnable comme meilleure estimation (ex: "semaine du 14 septembre" → lundi 14 au vendredi 18 septembre ; "fin octobre" → 25 au 31 octobre ; "début novembre" → 1 au 5 novembre) et remplis approx_label avec un texte court et fidèle à ce que l'utilisateur a dit (ex: "Semaine du 14 septembre", "Fin octobre"). Ne présente jamais une date approximative comme certaine.
- Si les dates sont explicites et complètes, is_approximate=false et approx_label=null.

Note : le champ "note" est optionnel, mets null si rien de pertinent n'est mentionné (n'invente rien).

Réponds UNIQUEMENT en appelant l'outil ${TOOL_NAME} avec un JSON valide respectant son schéma. N'ajoute aucun texte hors de l'appel d'outil.`;
}
