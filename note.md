# Pyodide

Les import de librairies ont l'air d'être partagée.
Les dataframes peuvent être stockées dans le navigateur !

Stratégie : 
 - Créer un décorateur qui insère une fonction dans un code Javascript
   - Le décorateur devra vérifier l'existence de pyodide et renvoyer le résultat du code
   - Attention paquet js ne sera pas défini ?

- Créer un composant qui charge pyodide ainsi que les librairies
    - Le composant exposera un attribut indiquant si les librairies ont été chargées ou non.