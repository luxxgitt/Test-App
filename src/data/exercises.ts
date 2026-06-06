import type { Exercise } from '../types';

export const exercises: Exercise[] = [
  // === PUSH EXERCISES ===
  {
    id: 'wall-push-up',
    nameEN: 'Wall Push-Up',
    nameFR: 'Pompe Murale',
    descriptionFR:
      'Placez vos mains à plat sur un mur, légèrement plus larges que les épaules. Inclinez votre corps vers le mur en pliant les coudes, puis repoussez. Gardez le corps droit comme une planche tout au long du mouvement.',
    muscleGroups: ['Pectoraux', 'Épaules', 'Triceps'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=wall+push+up+proper+form+tutorial+beginner',
    difficulty: 'débutant',
  },
  {
    id: 'knee-push-up',
    nameEN: 'Knee Push-Up',
    nameFR: 'Pompe sur Genoux',
    descriptionFR:
      'En appui sur les genoux et les mains, descendez la poitrine vers le sol en pliant les coudes à 45 degrés. Remontez en contractant les pectoraux. Gardez le dos droit et les abdominaux engagés.',
    muscleGroups: ['Pectoraux', 'Épaules', 'Triceps'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=knee+push+up+proper+form+tutorial+beginner',
    difficulty: 'débutant',
  },
  {
    id: 'push-up',
    nameEN: 'Push-Up',
    nameFR: 'Pompe',
    descriptionFR:
      'En position de planche, mains légèrement plus larges que les épaules. Descendez la poitrine jusqu\'à effleurer le sol, coudes à 45 degrés du corps. Poussez explosiment vers le haut en expirant.',
    muscleGroups: ['Pectoraux', 'Épaules', 'Triceps', 'Gainage'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=push+up+proper+form+tutorial',
    difficulty: 'intermédiaire',
  },
  {
    id: 'pike-push-up',
    nameEN: 'Pike Push-Up',
    nameFR: 'Pompe Pike',
    descriptionFR:
      'Partez en position de planche, puis levez les hanches pour former un V inversé. Fléchissez les coudes et descendez la tête vers le sol, puis repoussez. Ce mouvement cible principalement les épaules.',
    muscleGroups: ['Épaules', 'Triceps', 'Pectoraux supérieurs'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=pike+push+up+proper+form+tutorial',
    difficulty: 'intermédiaire',
  },
  {
    id: 'diamond-push-up',
    nameEN: 'Diamond Push-Up',
    nameFR: 'Pompe Diamant',
    descriptionFR:
      'Placez vos mains sous la poitrine en formant un diamant avec vos pouces et index. Descendez lentement la poitrine vers vos mains, puis repoussez. Ce mouvement cible intensément les triceps.',
    muscleGroups: ['Triceps', 'Pectoraux internes', 'Épaules'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=diamond+push+up+proper+form+tutorial',
    difficulty: 'avancé',
  },
  {
    id: 'chair-dips',
    nameEN: 'Chair Dips',
    nameFR: 'Dips sur Chaise',
    descriptionFR:
      'Assis au bord d\'une chaise stable, mains posées sur le rebord. Glissez vers l\'avant, fléchissez les coudes jusqu\'à 90 degrés, puis repoussez. Gardez le dos proche de la chaise tout au long.',
    muscleGroups: ['Triceps', 'Épaules', 'Pectoraux inférieurs'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=chair+tricep+dips+proper+form+tutorial',
    difficulty: 'débutant',
  },

  // === PULL EXERCISES ===
  {
    id: 'inverted-row',
    nameEN: 'Inverted Row (Table)',
    nameFR: 'Rowing Inversé (Table)',
    descriptionFR:
      'Allongez-vous sous une table solide, saisissez le bord avec les mains plus larges que les épaules, corps en planche. Tirez la poitrine vers le bord de la table, serrez les omoplates, puis redescendez lentement.',
    muscleGroups: ['Dorsaux', 'Biceps', 'Rhomboïdes'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=inverted+row+table+proper+form+tutorial',
    difficulty: 'débutant',
  },
  {
    id: 'doorframe-row',
    nameEN: 'Doorframe Row',
    nameFR: 'Rowing Encadrement de Porte',
    descriptionFR:
      'Saisissez les deux côtés d\'un encadrement de porte solide, penchez-vous en arrière, bras tendus. Tirez votre corps vers la porte en fléchissant les coudes, puis revenez lentement en position initiale.',
    muscleGroups: ['Dorsaux', 'Biceps', 'Avant-bras'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=doorframe+row+bodyweight+tutorial',
    difficulty: 'débutant',
  },
  {
    id: 'dead-hang',
    nameEN: 'Dead Hang',
    nameFR: 'Suspension Passive',
    descriptionFR:
      'Saisissez une barre (ou le haut d\'une porte solide) et laissez votre corps se suspendre librement. Engagez légèrement les épaules en les abaissant. Cet exercice renforce la prise et décompresse la colonne.',
    muscleGroups: ['Avant-bras', 'Épaules', 'Dorsaux'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=dead+hang+benefits+proper+form+tutorial',
    difficulty: 'débutant',
  },
  {
    id: 'negative-pull-up',
    nameEN: 'Negative Pull-Up',
    nameFR: 'Traction Négative',
    descriptionFR:
      'Montez au-dessus d\'une barre en sautant ou avec une chaise, menton au-dessus de la barre. Descendez TRÈS lentement (5-8 secondes) en contrôlant la résistance. C\'est la meilleure façon d\'apprendre les tractions.',
    muscleGroups: ['Dorsaux', 'Biceps', 'Rhomboïdes'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=negative+pull+up+tutorial+beginner',
    difficulty: 'intermédiaire',
  },

  // === LEGS ===
  {
    id: 'squat',
    nameEN: 'Squat',
    nameFR: 'Squat',
    descriptionFR:
      'Pieds à largeur d\'épaules, orteils légèrement tournés vers l\'extérieur. Descendez comme si vous vous asseyiez sur une chaise imaginaire, genoux alignés avec les orteils. Remontez en poussant dans les talons.',
    muscleGroups: ['Quadriceps', 'Fessiers', 'Ischio-jambiers'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=bodyweight+squat+proper+form+tutorial',
    difficulty: 'débutant',
  },
  {
    id: 'sumo-squat',
    nameEN: 'Sumo Squat',
    nameFR: 'Squat Sumo',
    descriptionFR:
      'Écartez les pieds plus que la largeur des épaules, orteils pointant vers l\'extérieur à 45°. Descendez en gardant le dos droit et les genoux dans l\'alignement des orteils. Contractez les fessiers et l\'intérieur des cuisses en remontant.',
    muscleGroups: ['Adducteurs', 'Fessiers', 'Quadriceps'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=sumo+squat+proper+form+tutorial',
    difficulty: 'débutant',
  },
  {
    id: 'reverse-lunge',
    nameEN: 'Reverse Lunge',
    nameFR: 'Fente Arrière',
    descriptionFR:
      'Debout, faites un grand pas en arrière avec un pied. Fléchissez les deux genoux jusqu\'à ce que le genou arrière effleure presque le sol. Poussez avec le pied avant pour revenir en position debout. Alternez les côtés.',
    muscleGroups: ['Quadriceps', 'Fessiers', 'Ischio-jambiers'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=reverse+lunge+proper+form+tutorial',
    difficulty: 'débutant',
  },
  {
    id: 'glute-bridge',
    nameEN: 'Glute Bridge',
    nameFR: 'Pont Fessier',
    descriptionFR:
      'Allongez-vous sur le dos, genoux fléchis, pieds à plat. Poussez dans les talons pour lever les hanches vers le plafond, en serrant fort les fessiers au sommet. Redescendez lentement sans toucher le sol entre les répétitions.',
    muscleGroups: ['Fessiers', 'Ischio-jambiers', 'Lombaires'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=glute+bridge+proper+form+tutorial',
    difficulty: 'débutant',
  },
  {
    id: 'hip-thrust',
    nameEN: 'Hip Thrust',
    nameFR: 'Poussée de Hanche',
    descriptionFR:
      'Dos appuyé contre un canapé ou banc, pieds à plat au sol. Poussez les hanches vers le haut en contractant intensément les fessiers au sommet. Maintenez 1-2 secondes en haut, redescendez lentement.',
    muscleGroups: ['Fessiers', 'Ischio-jambiers'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=hip+thrust+proper+form+tutorial+bodyweight',
    difficulty: 'intermédiaire',
  },
  {
    id: 'calf-raise',
    nameEN: 'Calf Raise',
    nameFR: 'Montée sur Pointes',
    descriptionFR:
      'Debout, pieds à largeur d\'épaules. Montez sur la pointe des pieds aussi haut que possible, maintenez 1 seconde, puis redescendez lentement. Vous pouvez vous tenir à un mur pour l\'équilibre. Faites le mouvement complet et contrôlé.',
    muscleGroups: ['Mollets', 'Tibias'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=calf+raise+proper+form+tutorial',
    difficulty: 'débutant',
  },
  {
    id: 'jump-squat',
    nameEN: 'Jump Squat',
    nameFR: 'Squat Sauté',
    descriptionFR:
      'Commencez en position squat, cuisses parallèles au sol. Explosez vers le haut en sautant le plus haut possible. Atterrissez doucement sur la pointe des pieds, les genoux légèrement fléchis, et enchaînez directement le prochain squat.',
    muscleGroups: ['Quadriceps', 'Fessiers', 'Mollets'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=jump+squat+proper+form+tutorial',
    difficulty: 'intermédiaire',
  },
  {
    id: 'bulgarian-split-squat',
    nameEN: 'Bulgarian Split Squat',
    nameFR: 'Squat Bulgare',
    descriptionFR:
      'Pied arrière posé sur une chaise ou un banc, pied avant avancé. Descendez le genou arrière vers le sol en gardant le buste droit. Poussez avec le talon avant pour remonter. C\'est l\'un des meilleurs exercices pour les jambes.',
    muscleGroups: ['Quadriceps', 'Fessiers', 'Ischio-jambiers'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=bulgarian+split+squat+proper+form+tutorial',
    difficulty: 'avancé',
  },

  // === CORE ===
  {
    id: 'plank',
    nameEN: 'Plank',
    nameFR: 'Planche',
    descriptionFR:
      'En appui sur les avant-bras et les orteils, corps parfaitement aligné de la tête aux talons. Contractez les abdominaux, les fessiers et les quadriceps. Respirez normalement et maintenez la position sans laisser les hanches s\'affaisser.',
    muscleGroups: ['Abdominaux', 'Gainage', 'Épaules'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=plank+proper+form+tutorial+core',
    difficulty: 'débutant',
  },
  {
    id: 'side-plank',
    nameEN: 'Side Plank',
    nameFR: 'Planche Latérale',
    descriptionFR:
      'En appui sur un avant-bras et le côté du pied, corps aligné de la tête aux pieds. Levez les hanches pour créer une ligne droite. Contractez les obliques et maintenez la position. Répétez de l\'autre côté.',
    muscleGroups: ['Obliques', 'Gainage latéral', 'Épaules'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=side+plank+proper+form+tutorial',
    difficulty: 'débutant',
  },
  {
    id: 'dead-bug',
    nameEN: 'Dead Bug',
    nameFR: 'Insecte Mort',
    descriptionFR:
      'Allongé sur le dos, bras tendus vers le plafond, hanches et genoux à 90°. Simultanément, descendez le bras droit et la jambe gauche vers le sol sans les toucher. Revenez au centre, respirez, puis changez de côté.',
    muscleGroups: ['Abdominaux profonds', 'Gainage', 'Coordination'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=dead+bug+exercise+proper+form+tutorial',
    difficulty: 'débutant',
  },
  {
    id: 'bird-dog',
    nameEN: 'Bird Dog',
    nameFR: 'Chien Pointeur',
    descriptionFR:
      'À quatre pattes, dos plat, mains sous les épaules et genoux sous les hanches. Tendez simultanément le bras droit et la jambe gauche, maintenez 2 secondes. Revenez, puis répétez de l\'autre côté. Gardez le bassin stable.',
    muscleGroups: ['Érecteurs du rachis', 'Fessiers', 'Coordination'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=bird+dog+exercise+proper+form+tutorial',
    difficulty: 'débutant',
  },
  {
    id: 'leg-raise',
    nameEN: 'Leg Raise',
    nameFR: 'Levée de Jambes',
    descriptionFR:
      'Allongé sur le dos, mains sous les fesses pour protéger le bas du dos. Jambes tendues, levez-les jusqu\'à la verticale, puis redescendez lentement sans les poser au sol. Contractez les abdominaux tout au long.',
    muscleGroups: ['Abdominaux inférieurs', 'Hip Flexors'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=leg+raise+proper+form+tutorial+abs',
    difficulty: 'intermédiaire',
  },
  {
    id: 'mountain-climbers',
    nameEN: 'Mountain Climbers',
    nameFR: 'Grimpeurs',
    descriptionFR:
      'En position de planche sur les mains, ramenez alternativement les genoux vers la poitrine le plus vite possible. Gardez les hanches basses et les bras tendus. Respirez régulièrement et maintenez un rythme soutenu.',
    muscleGroups: ['Abdominaux', 'Cardio', 'Épaules'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=mountain+climbers+proper+form+tutorial',
    difficulty: 'intermédiaire',
  },
  {
    id: 'hollow-body',
    nameEN: 'Hollow Body Hold',
    nameFR: 'Maintien Corps Creux',
    descriptionFR:
      'Allongé sur le dos, aplatissez le bas du dos contre le sol. Levez légèrement la tête, les épaules et les jambes. Bras tendus au-dessus de la tête. Maintenez cette position de "banane" en contractant les abdominaux.',
    muscleGroups: ['Abdominaux', 'Hip Flexors', 'Gainage'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=hollow+body+hold+proper+form+tutorial',
    difficulty: 'intermédiaire',
  },
  {
    id: 'crunch',
    nameEN: 'Crunch',
    nameFR: 'Crunch',
    descriptionFR:
      'Allongé sur le dos, genoux fléchis, mains derrière la nuque sans tirer. Soulevez les épaules du sol en contractant les abdominaux, pas le cou. Redescendez lentement. L\'amplitude est petite mais le travail musculaire est intense.',
    muscleGroups: ['Abdominaux supérieurs'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=crunch+proper+form+tutorial+abs',
    difficulty: 'débutant',
  },

  // === CARDIO / FULL BODY ===
  {
    id: 'burpee',
    nameEN: 'Burpee',
    nameFR: 'Burpee',
    descriptionFR:
      'Debout, descendez en squat, posez les mains au sol, sautez les pieds en arrière en position de planche, faites une pompe optionnelle, sautez les pieds vers les mains, puis explosez vers le haut avec les bras levés.',
    muscleGroups: ['Corps entier', 'Cardio', 'Explosivité'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=burpee+proper+form+tutorial+beginner',
    difficulty: 'intermédiaire',
  },
  {
    id: 'jumping-jacks',
    nameEN: 'Jumping Jacks',
    nameFR: 'Sauts Étoile',
    descriptionFR:
      'Debout, pieds joints et bras le long du corps. Sautez en écartant les pieds et en levant les bras au-dessus de la tête simultanément. Revenez en sautant à la position initiale. Gardez un rythme régulier et des genoux légèrement fléchis.',
    muscleGroups: ['Corps entier', 'Cardio', 'Coordination'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=jumping+jacks+proper+form+tutorial',
    difficulty: 'débutant',
  },
  {
    id: 'high-knees',
    nameEN: 'High Knees',
    nameFR: 'Genoux Hauts',
    descriptionFR:
      'Courez sur place en montant les genoux le plus haut possible, idéalement à hauteur des hanches. Balancez les bras opposés pour plus d\'efficacité. Restez sur l\'avant du pied et maintenez un rythme rapide et dynamique.',
    muscleGroups: ['Hip Flexors', 'Quadriceps', 'Cardio'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=high+knees+exercise+proper+form+tutorial',
    difficulty: 'débutant',
  },

  // === MOBILITY ===
  {
    id: 'worlds-greatest-stretch',
    nameEN: "World's Greatest Stretch",
    nameFR: 'Grande Fente avec Rotation',
    descriptionFR:
      'Partez en fente avant, posez la main du même côté que le pied avant au sol. Tournez le buste en levant l\'autre bras vers le plafond, puis inversez. Excellent pour la mobilité globale des hanches, du thorax et des épaules.',
    muscleGroups: ['Hanches', 'Thorax', 'Épaules', 'Mobilité'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=worlds+greatest+stretch+tutorial+mobility',
    difficulty: 'débutant',
  },
  {
    id: 'hip-flexor-stretch',
    nameEN: 'Hip Flexor Stretch',
    nameFR: 'Étirement Fléchisseurs de Hanche',
    descriptionFR:
      'En position de fente basse, le genou arrière au sol. Poussez les hanches vers l\'avant pour sentir l\'étirement dans l\'aine et le devant de la cuisse arrière. Maintenez 30 secondes et respirez profondément. Changez de côté.',
    muscleGroups: ['Fléchisseurs de hanche', 'Quadriceps', 'Mobilité'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=hip+flexor+stretch+tutorial+proper+form',
    difficulty: 'débutant',
  },
  {
    id: 'thoracic-rotation',
    nameEN: 'Thoracic Rotation',
    nameFR: 'Rotation Thoracique',
    descriptionFR:
      'À quatre pattes ou en position de fente, placez une main derrière la tête. Tournez le coude vers le plafond en suivant avec les yeux, ouvrez la cage thoracique au maximum. Revenez et répétez. Idéal pour améliorer la posture.',
    muscleGroups: ['Thorax', 'Colonne vertébrale', 'Mobilité'],
    youtubeSearchUrl:
      'https://www.youtube.com/results?search_query=thoracic+rotation+exercise+tutorial+mobility',
    difficulty: 'débutant',
  },
];

export const getExerciseById = (id: string): Exercise | undefined => {
  return exercises.find((ex) => ex.id === id);
};
