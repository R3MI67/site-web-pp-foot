// ---------- Groupes de joueurs et leur radar fixe ----------
// 1) Ajoute un groupe dans RADAR_GROUPS avec ses 6 valeurs (0 à 100).
// 2) Associe chaque nom de joueur (identique à celui écrit dans players.js) à son groupe dans PLAYER_TO_GROUP.
// Deux joueurs dans le même groupe partagent exactement le même radar.

const RADAR_AXES =   ['Vitesse', 'Explosivité', 'Puissance', 'Force', 'Endurance' , 'Gainage' ,'Agilité']  ;

const RADAR_GROUPS = {

  'exemple-groupe': { Vitesse: 10, Explosivité: 10, Puissance: 10, Force: 10, Endurance: 10, Gainage: 10, Agilité: 10 }, 

  'g1': { Vitesse: 40, Explosivité: 90, Puissance: 80, Force: 60, Endurance: 30, Gainage: 50, Agilité: 90 }, // gardien mur
  'g2': { Vitesse: 40, Explosivité: 99, Puissance: 70, Force: 50, Endurance: 30, Gainage: 50, Agilité: 99 }, // gardien chat
  'g3': { Vitesse: 40, Explosivité: 90, Puissance: 70, Force: 50, Endurance: 40, Gainage: 60, Agilité: 90 }, // gardien polyvalent

  'd1': { Vitesse: 40, Explosivité: 30, Puissance: 99, Force: 90, Endurance: 40, Gainage: 90, Agilité: 20 }, // central duel
  'd2': { Vitesse: 30, Explosivité: 30, Puissance: 90, Force: 60, Endurance: 50, Gainage: 80, Agilité: 20 }, // central libero
  'd3': { Vitesse: 40, Explosivité: 30, Puissance: 90, Force: 80, Endurance: 40, Gainage: 80, Agilité: 20 }, // central polyvalent

  'l1': { Vitesse: 90, Explosivité: 70, Puissance: 50, Force: 40, Endurance: 80, Gainage: 80, Agilité: 80 }, // latéral offensif
  'l2': { Vitesse: 90, Explosivité: 60, Puissance: 70, Force: 40, Endurance: 80, Gainage: 80, Agilité: 60 }, // latéral puissant
  'l3': { Vitesse: 80, Explosivité: 60, Puissance: 50, Force: 40, Endurance: 90, Gainage: 90, Agilité: 60 }, // latéral polyvalent

  'm1': { Vitesse: 60, Explosivité: 50, Puissance: 80, Force: 40, Endurance: 90, Gainage: 80, Agilité: 80 }, // milieu box to box
  'm2': { Vitesse: 50, Explosivité: 50, Puissance: 40, Force: 20, Endurance: 99, Gainage: 80, Agilité: 80 }, // milieu sentinelle
  'm3': { Vitesse: 20, Explosivité: 60, Puissance: 60, Force: 50, Endurance: 90, Gainage: 80, Agilité: 60 }, // milieu costaud
  'm4': { Vitesse: 40, Explosivité: 50, Puissance: 40, Force: 20, Endurance: 80, Gainage: 80, Agilité: 80 }, // milieu offensif

  'a1': { Vitesse: 90, Explosivité: 90, Puissance: 70, Force: 30, Endurance: 30, Gainage: 50, Agilité: 90 }, // aillier provocateur
  'a2': { Vitesse: 70, Explosivité: 90, Puissance: 80, Force: 60, Endurance: 30, Gainage: 70, Agilité: 80 }, // ailier casseur de defense
  'a3': { Vitesse: 70, Explosivité: 90, Puissance: 80, Force: 40, Endurance: 30, Gainage: 50, Agilité: 80 }, // ailier moderne
  'a4': { Vitesse: 99, Explosivité: 99, Puissance: 80, Force: 30, Endurance: 30, Gainage: 30, Agilité: 60 }, // ailier fusée

  'b1': { Vitesse: 50, Explosivité: 80, Puissance: 90, Force: 70, Endurance: 30, Gainage: 70, Agilité: 60 }, // buteur appuis finisseur
  'b2': { Vitesse: 90, Explosivité: 80, Puissance: 90, Force: 50, Endurance: 30, Gainage: 60, Agilité: 60 }  // buteur puissant
};

const PLAYER_TO_GROUP = {
  'Peter Cech': 'g1',
  'Peter Schmeichel': 'g1',
  'Edwin Van Der Sar': 'g1',
  'Thibaut Courtois': 'g1',
  'Jan Oblak': 'g1',
  'Gianluigi Donnarumma': 'g1',
  'David De Gea': 'g1',
  'Hugo Lloris': 'g2',
  'Dida': 'g2',
  'Fabien Barthez': 'g2',
  'Victor Valdes': 'g2',
  'Keylor Navas': 'g2',
  'Lev Yashin': 'g3',
  'Manuel Neuer': 'g3',
  'Iker Casillas': 'g3',
  'Oliver Kahn': 'g3',
  'Alisson Becker': 'g3',
  'Marc-André Ter Stegen': 'g3',
  'Emiliano Martinez': 'g3',
  'Gianluigi Buffon': 'g2',

  "Franz Beckenbauer": 'd2',
  "Franco Baresi": 'd2',
  "Paolo Maldini": 'd2',
  "Alessandro Nesta": 'd2',
  "Fabio Cannavaro": 'd2',
  "Virgil Van Dijk": 'd3',
  "Nemanja Vidic": 'd1',
  "Sergio Ramos": 'd1', 
  "Carles Puyol": 'd1', 
  "Lilian Thuram": 'd1', 
  "Rio Ferdinand": 'd1', 
  "Gerard Piqué": 'd2', 
  "Marquinhos": 'd3',
  "Saliba": 'd3',
  "Dias": 'd3',
  "Antonio Rüdiger": 'd1',

  "Roberto Carlos": 'l2',
  "Cafu": 'l3',
  "Philipp Lahm": 'l3',
  "Dani Alves": 'l1',
  "Ashley Cole": 'l2',
  "Marcelo": 'l1',
  "Javier Zanetti": 'l3',
  "Joshua Kimmich": 'l3',
  "Bixente Lizarazu": 'l3',
  "Gianluca Zambrotta": 'l3',
  "Maicon": 'l2', 
  "David Alaba": 'l3',
  "Jordi Alba": 'l1',
  "Trent Alexander-Arnold": 'l3',
  "Kyle Walker": 'l2',
  "Dani Carvajal": 'l3',
  "Achraf Hakimi": 'l2',
  "Patrice Evra": 'l3',
  "Alphonso Davies": 'l2',
  "Theo Hernandez": 'l2',

  "Zinédine Zidane":'m4',
  "Luka Modric":'m2',
  "Xavi Hernandez":'m2',
  "Andres Iniesta":'m2', 
  "Lothar Matthaus":'m1', 
  "Michael Laudrup":'m4', 
  "Steven Gerrard":'m1', 
  "Clarence Seedorf":'m1', 
  "Kevin de Bruyne":'m4',  
  "Kaka":'m4', 
  "Frank Lampard":'m3',  
  "Paul Scholes":'m3',  
  "Rodri":'m2',  
  "Andrea Pirlo":'m2', 
  "Sergio Busquets":'m3',  
  "Patrick Vieira":'m3',  
  "N'Golo Kanté":'m2', 
  "Yaya Touré":'m1',  
  "Toni Kroos":'m2',  
  "Roy Keane":'m3',  
  "Frank Rijkaard":'m3', 
  "Mesut Özil":'m4',  
  "Federico Valverde":'m1',  
  "Jude Bellingham":'m1',  
  "Paul Pogba":'m1', 
  "Pedri":'m2',  
  "Vitinha":'m2',  
  "Bruno Fernandes":'m4',  

  "Cristiano Ronaldo":'a2',
  "Lionel Messi":'a2', 
  "Ronaldinho":'a1',  
  "Luís Figo":'a2', 
  "David Beckham":'a2', 
  "Arjen Robben":'a2',  
  "Franck Ribéry":'a2',  
  "Kylian Mbappé":'a4', 
  "Eden Hazard":'a2', 
  "Ángel Di María":'a2', 
  "Alexis Sánchez":'a2',  
  "Sadio Mané":'a4',  
  "Mohamed Salah":'a2', 
  "Ousmane Dembélé":'a1', 
  "Adama Traoré":'a2', 
  "Neymar":'a1', 
  "Vinícius Júnior":'a1',  
  "Lamine Yamal":'a3', 
  "Raphinha":'a4',  
  "Michael Olise":'a3',  
  "Cole Palmer":'a3',  
  "Khvicha Kvaratskhelia":'a2',  
  "Rafael Leão":'a4',  
  "Désiré Doué":'a1',  

  "Thierry Henry":'b2', 
  "Luis Suárez":'b1', 
  "Robert Lewandowski":'b1', 
  "Wayne Rooney":'b2',  
  "Karim Benzema":'b1',  
  "Andriy Shevchenko":'b2',  
  "Raúl":'b2', 
  "Zlatan Ibrahimović":'b1', 
  "Sergio Agüero":'b2',  
  "Samuel Eto'o":'b1',  
  "Ronaldo Nazário":'b2', 
  "Antoine Griezmann":'b2', 
  "Didier Drogba":'b1',  
  "Harry Kane":'b1',  
  "Robin Van Persie":'b1',  
  "Erling Haaland":'b1', 
  "David Villa":'b2', 
  "Edinson Cavani":'b2', 
  "Miroslav Klose":'b1',  
  "Diego Costa":'b1',  
   
  
};

const DEFAULT_RADAR_GROUP = 'exemple-groupe'; // utilisé si le joueur choisi n'a pas encore de groupe assigné
