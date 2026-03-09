export default {
    faq: {
        heading: 'Questions fréquemment posées',
        question1: 'Qunt Edge trade-t-il pour moi ?',
        answer1: 'Non, Qunt Edge n\'est pas un courtier. Vous exécutez vos trades chez votre courtier, puis transférez les données dans Qunt Edge pour suivre et analyser vos performances de trading.',
        question2: 'Quelle est la sécurité de Qunt Edge ?',
        answer2: 'La sécurité de vos données est notre priorité absolue. Qunt Edge ne vend pas et ne fait pas de publicité avec vos données, et nous utilisons des mesures de sécurité standard de l\'industrie pour protéger vos informations.',
        question3: 'Comment Qunt Edge synchronise mon historique de trading ?',
        answer3: 'Nous avons développé nos propres services de synchronisation avec Rithmic, Tradovate et le copieur Thor. Ils fonctionnent tous différemment. Rithmic par exemple, n\'autorise pas OAuth, et pour des raisons de sécurité, nous ne stockons pas vos identifiants. Ils sont stockés en toute sécurité sur votre ordinateur et accessibles depuis le moteur de synchronisation de Qunt Edge uniquement lorsque vous êtes connecté. Tradovate en revanche permet le flux OAuth, ce qui permet à Qunt Edge de demander un accès en lecture à votre historique de trading et de sauvegarder vos trades quotidiennement même si vous ne vous connectez pas à Qunt Edge. Enfin, Thor fonctionne en sauvegardant toutes vos données de trading sur leur serveur et vous décidez quand télécharger vos données vers Qunt Edge en utilisant leur logiciel.',
        question4: 'Comment mettre à jour vers la dernière version ?',
        answer4: 'Qunt Edge fonctionne comme une application web qui permet aux mises à jour de se refléter instantanément dans votre navigateur. Vous n\'avez pas besoin d\'exécuter de mises à jour.',
        question5: 'Est-il possible d\'exécuter Qunt Edge localement ?',
        answer5: 'Qunt Edge n\'est pas disponible pour un déploiement local car vous ne pourrez pas utiliser les services de synchronisation (qui nécessitent la conformité), mais nous travaillons sur une version locale avec un support complet pour les imports .csv et .pdf',
        question6: 'Pourquoi le plan Pro ne propose-t-il pas de période d\'essai ?',
        answer6: 'Qunt Edge propose une version gratuite (Basique) avec jusqu\'à 30 jours de stockage de données. Cela offre suffisamment de temps pour évaluer la plateforme et voir la valeur des analyses assistées par l\'IA avant de passer à Pro pour un historique illimité.',
    },
} as const;
