
import { Theme, Transport, Language, AccommodationMode, RestaurantRecommendation } from './types';

export const THEME_ICONS: Record<Theme, string> = {
  [Theme.HISTORICAL]: '🏛️',
  [Theme.CIVIL_WAR]: '🛡️',
  [Theme.GEOLOGICAL]: '🪨',
  [Theme.NATURE]: '🌿',
  [Theme.GASTRONOMIC]: '🥘',
  [Theme.CUSTOM]: '✨',
};

export const TRANSPORT_ICONS: Record<Transport, string> = {
  [Transport.WALKING]: '👟',
  [Transport.BUS]: '🚌',
  [Transport.CAR]: '🚗',
  [Transport.RIVER]: '🛳️',
  [Transport.TRAIN]: '🚆',
  [Transport.BIKE]: '🚲',
  [Transport.TAXI]: '🚖',
  [Transport.MIX]: '🔀'
};

export const DEFAULT_PREFERENCES = {
  language: 'ca' as Language,
  theme: Theme.HISTORICAL,
  customThemes: [] as Theme[],
  selectedPOIs: [] as string[],
  duration: 1,
  transport: Transport.WALKING,
  customTransports: [] as Transport[],
  startDate: '',
  includeUpriver: false,
  accommodationMode: AccommodationMode.BASE,
  baseLocation: 'Amposta'
};

// Map each POI to its specific Town/Area for grouping in the UI
export const POI_LOCATIONS: Record<string, string> = {
  // Amposta
  "Pont Penjant d'Amposta": "Amposta",
  "Castell d'Amposta": "Amposta",
  "Museu de les Terres de l'Ebre": "Amposta",
  "Cases Modernistes (Casa Fàbregues)": "Amposta",
  "Mercat Municipal": "Amposta",
  "Façana Fluvial": "Amposta",
  "Port d'Amposta (Restaurants)": "Amposta",
  // Delta
  "MónNatura Delta de l'Ebre": "Delta de l'Ebre",
  "Llacuna de l'Encanyissada": "Delta de l'Ebre",
  "Casa de Fusta": "Delta de l'Ebre",
  "Llacuna de la Tancada": "Delta de l'Ebre",
  "Platja del Trabucador": "Delta de l'Ebre",
  "Illa de Buda (Vistes des del mirador)": "Delta de l'Ebre",
  "El Garxal": "Delta de l'Ebre",
  "Muscleres del Delta (Degustació)": "Delta de l'Ebre",
  "Poble Nou del Delta": "Delta de l'Ebre",
  "Camps d'Arròs (Visita agrària)": "Delta de l'Ebre",
  "Ullals de Baltasar (Surgències d'aigua)": "Delta de l'Ebre",
  "Punta del Fangar (Dunes)": "Delta de l'Ebre",
  "Punta de la Banya": "Delta de l'Ebre",
  "Desembocadura del Riu Ebre": "Delta de l'Ebre",
  // Tortosa
  "Catedral de Santa Maria": "Tortosa",
  "Castell de la Suda (Parador)": "Tortosa",
  "Reials Col·legis": "Tortosa",
  "Refugi Antiaeri núm. 4": "Tortosa",
  "Jardins del Príncep": "Tortosa",
  "Mercat Modernista de Tortosa": "Tortosa",
  // Miravet
  "Castell Templer de Miravet": "Miravet",
  "Nucli Antic (Cap de la Vila)": "Miravet",
  "Pas de Barca (Miravet)": "Miravet",
  "Església Vella": "Miravet",
  // Móra / Corbera / Terra Alta
  "Poble Vell de Corbera (Guerra Civil)": "Corbera d'Ebre",
  "Castell de Móra d'Ebre": "Móra d'Ebre",
  "Memorial de les Camposines": "Terra Alta",
  "Coll del Moro": "Gandesa",
  "Centre 115 Dies": "Corbera d'Ebre",
  "Coves Meravelles": "Benifallet"
};

// Database of Points of Interest per Theme
export const THEME_POIS: Record<Theme, string[]> = {
  [Theme.HISTORICAL]: [
    "Pont Penjant d'Amposta",
    "Castell d'Amposta",
    "Museu de les Terres de l'Ebre",
    "Cases Modernistes (Casa Fàbregues)",
    "Catedral de Santa Maria", // Tortosa
    "Castell de la Suda (Parador)", // Tortosa
    "Reials Col·legis", // Tortosa
    "Castell Templer de Miravet", // Miravet
    "Nucli Antic (Cap de la Vila)", // Miravet
    "Pas de Barca (Miravet)", // Miravet
    "Castell de Móra d'Ebre" // Móra
  ],
  [Theme.CIVIL_WAR]: [
    "Refugi Antiaeri núm. 4", // Tortosa
    "Poble Vell de Corbera (Guerra Civil)", // Corbera
    "Centre 115 Dies", // Corbera
    "Memorial de les Camposines", // Terra Alta
    "Coll del Moro", // Gandesa
    "Torre de la Carrova", // Amposta
    "Espais de la Batalla de l'Ebre" // General
  ],
  [Theme.GEOLOGICAL]: [
    "Coves Meravelles", // Benifallet
    "Ullals de Baltasar (Surgències d'aigua)",
    "Punta del Fangar (Dunes)",
    "Punta de la Banya",
    "Desembocadura del Riu Ebre",
    "Serra del Montsià (La Foradada)"
  ],
  [Theme.NATURE]: [
    "MónNatura Delta de l'Ebre",
    "Llacuna de l'Encanyissada",
    "Casa de Fusta",
    "Llacuna de la Tancada",
    "Platja del Trabucador",
    "Illa de Buda (Vistes des del mirador)",
    "El Garxal",
    "Jardins del Príncep" // Tortosa
  ],
  [Theme.GASTRONOMIC]: [
    "Muscleres del Delta (Degustació)",
    "Poble Nou del Delta",
    "Port d'Amposta (Restaurants)",
    "Mercat Municipal", // Amposta
    "Mercat Modernista de Tortosa", // Tortosa
    "Camps d'Arròs (Visita agrària)"
  ],
  [Theme.CUSTOM]: [] // Populated dynamically
};

export const RECOMMENDED_RESTAURANTS: RestaurantRecommendation[] = [
  {
    name: "L'Algadir del Delta",
    location: "Poble Nou del Delta",
    phone: "+34 977 74 45 59",
    price: "€€-€€€",
    specialty: { ca: "Arròs i Cuina d'Autor (Bib Gourmand)", es: "Arroz y Cocina de Autor (Bib Gourmand)", en: "Rice & Signature Cuisine (Bib Gourmand)" }
  },
  {
    name: "Restaurant L'Estany - Casa de Fusta",
    location: "Delta de l'Ebre (Encanyissada)",
    phone: "+34 977 26 10 26",
    price: "€€",
    specialty: { ca: "Cuina Tradicional i Arrossos", es: "Cocina Tradicional y Arroces", en: "Traditional Cuisine & Rice" }
  },
  {
    name: "Can Batiste",
    location: "La Ràpita",
    phone: "+34 977 74 04 62",
    price: "€€€",
    specialty: { ca: "Marisc i Peix Fresc", es: "Marisco y Pescado Fresco", en: "Seafood & Fresh Fish" }
  },
  {
    name: "Bueso Restaurant",
    location: "Amposta",
    phone: "+34 977 70 23 48",
    price: "€€",
    specialty: { ca: "Cuina de Mercat", es: "Cocina de Mercado", en: "Market Cuisine" }
  },
  {
    name: "Restaurant Parc",
    location: "Tortosa",
    phone: "+34 977 44 48 66",
    price: "€€-€€€",
    specialty: { ca: "Menú Degustació", es: "Menú Degustación", en: "Tasting Menu" }
  },
  {
    name: "Molí de Xim",
    location: "Miravet",
    phone: "+34 977 40 71 36",
    price: "€€",
    specialty: { ca: "Cuina tradicional en un molí d'oli", es: "Cocina tradicional en un molino", en: "Traditional cuisine in an oil mill" }
  },
  {
    name: "Can Manel",
    location: "Les Cases d'Alcanar",
    phone: "+34 977 73 70 60",
    price: "€€-€€€",
    specialty: { ca: "Els millors llagostins", es: "Los mejores langostinos", en: "The best prawns" }
  }
];

interface Translation {
  title: string;
  subtitle: string;
  beta: string;
  generate_btn: string;
  generating_btn: string;
  share_btn: string;
  email_btn: string;
  pdf_btn: string;
  save_btn: string;
  saved_trips_btn: string;
  saved_trips_title: string;
  no_saved_trips: string;
  load_btn: string;
  delete_btn: string;
  create_new_btn: string;
  section_1_title: string;
  section_2_title: string;
  section_3_title: string;
  section_accommodation_title: string;
  section_4_title: string;
  section_pois_title: string;
  label_duration: string;
  label_day: string;
  label_days: string;
  label_date: string;
  label_date_hint: string;
  label_river_option: string;
  label_river_hint: string;
  label_extra_hint: string;
  label_custom_selection: string;
  label_custom_transport_selection: string;
  label_pois_hint: string;
  label_base_location: string;
  themes: Record<Theme, { label: string; desc: string }>;
  transports: Record<Transport, string>;
  accommodations: Record<AccommodationMode, { label: string; desc: string }>;
  results: {
    itinerary_title: string;
    scheduled_date: string;
    suggested_route: string;
    river_note_upriver: string;
    river_note_local: string;
    view_full_river_route: string;
    pier_locations: string;
    river_route_title: string;
    plan_title: string;
    day: string;
    no_activities: string;
    bookings_title: string;
    bookings_subtitle: string;
    web_info: string;
    book_table: string;
    search_tickets: string;
    verify_warning: string;
    detected_places: string;
    verified_sources: string;
    view_map: string;
    verify_btn: string;
    directions_btn: string;
    add_note_btn: string;
    edit_note_btn: string;
    save_note: string;
    cancel_note: string;
    note_placeholder: string;
    your_notes_label: string;
    transport_labels: Record<Transport, string>;
    view_booking_btn: string;
    generate_image_btn: string;
    generating_image: string;
    check_bus_stop: string;
    check_river_pier: string;
    special_event: string;
    step_by_step_btn: string;
    loading_instructions: string;
    instructions_title: string;
    nearby_attractions_btn: string;
    loading_nearby: string;
    nearby_title: string;
    no_nearby_found: string;
    copy_step: string;
    copied: string;
    saved_success: string;
    restaurants_title: string;
    report_issue: string;
  };
  errors: {
    generic: string;
    api_missing: string;
  };
  delta_info: {
    title: string;
    subtitle: string;
    content: string;
  };
  travel_tips: {
    title: string;
    subtitle: string;
    content: string;
  };
  taxi_info: {
      title: string;
      content: string;
  }
}

export const TRANSLATIONS: Record<Language, Translation> = {
  ca: {
    title: "Ebre",
    subtitle: "Descobreix Amposta, Tortosa, Miravet i el Delta de l'Ebre.",
    beta: "Beta AI",
    generate_btn: "Generar Ruta",
    generating_btn: "Planificant...",
    share_btn: "Compartir",
    email_btn: "Email",
    pdf_btn: "PDF",
    save_btn: "Guardar",
    saved_trips_btn: "Els meus Viatges",
    saved_trips_title: "Viatges Guardats",
    no_saved_trips: "Encara no tens viatges guardats.",
    load_btn: "Carregar",
    delete_btn: "Esborrar",
    create_new_btn: "Nou Viatge",
    section_1_title: "Quina experiència busques?",
    section_2_title: "Durada i Data",
    section_3_title: "Transport",
    section_accommodation_title: "Alojament",
    section_4_title: "Alguna cosa més? (Opcional)",
    section_pois_title: "Llocs específics i Pobles",
    label_duration: "DURADA",
    label_day: "Dia",
    label_days: "Dies",
    label_date: "DATA D'INICI (Recomanat)",
    label_date_hint: "Controlarem dies de tancament (dilluns) i festius.",
    label_river_option: "Incloure ruta riu amunt",
    label_river_hint: "Afegir visita a **Tortosa** o **Miravet** via fluvial.",
    label_extra_hint: "Ex: Viatjo amb nens, sóc vegetarià, m'interessa la fotografia...",
    label_custom_selection: "Selecciona els temes a combinar:",
    label_custom_transport_selection: "Selecciona els mitjans a combinar:",
    label_pois_hint: "Selecciona els llocs/pobles que VOLS visitar:",
    label_base_location: "On tens l'hotel/casa?",
    themes: {
      [Theme.HISTORICAL]: { label: "Històric (Tortosa/Miravet/Amposta)", desc: "Catedrals, Castells Templers i Modernisme." },
      [Theme.CIVIL_WAR]: { label: "Guerra Civil (Corbera/Terra Alta)", desc: "Trinxeres, Poble Vell i espais de memòria." },
      [Theme.GEOLOGICAL]: { label: "Geològic i Coves", desc: "Coves Meravelles, Ports i Delta." },
      [Theme.NATURE]: { label: "Natura i Delta", desc: "Observació d'aus, llacunes i platges verges." },
      [Theme.GASTRONOMIC]: { label: "Gastronòmic i Vins", desc: "Arròs del Delta, clotxa i vins de la Terra Alta." },
      [Theme.CUSTOM]: { label: "Personalitzat (Mix)", desc: "Crea la teva pròpia aventura combinant temes." }
    },
    transports: {
      [Transport.WALKING]: "A peu (Dins pobles)",
      [Transport.BUS]: "Autobús (Hife)",
      [Transport.CAR]: "Cotxe propi",
      [Transport.RIVER]: "Vaixell / Transport Fluvial",
      [Transport.TRAIN]: "Tren (Rodalies/Mitja Distància)",
      [Transport.BIKE]: "Bicicleta / Via Verda",
      [Transport.TAXI]: "Taxi (Privat)",
      [Transport.MIX]: "Mix / Combinat"
    },
    accommodations: {
        [AccommodationMode.BASE]: { label: "Camp Base (Fix)", desc: "Dormir sempre al mateix lloc." },
        [AccommodationMode.ROUTE]: { label: "Ruta (Itinerant)", desc: "Dormir a diferents pobles." }
    },
    results: {
      itinerary_title: "El teu Itinerari",
      scheduled_date: "Data programada",
      suggested_route: "Ruta suggerida",
      river_note_upriver: "Ruta que connecta el Delta amb l'interior (Tortosa/Miravet).",
      river_note_local: "Mostrant accessibilitat des de l'embarcador detectat.",
      view_full_river_route: "Veure ruta fluvial completa",
      pier_locations: "Embarcadors clau",
      river_route_title: "Ruta Fluvial Ebre",
      plan_title: "Pla de Viatge",
      day: "Dia",
      no_activities: "No hi ha activitats programades per a aquest dia.",
      bookings_title: "Reserves i Disponibilitat",
      bookings_subtitle: "Enllaços ràpids per entrades i taules",
      web_info: "Web Info",
      book_table: "Reservar Taula",
      search_tickets: "Cercar Entrades",
      verify_warning: "* Important: Verifica sempre els horaris. Molts museus tanquen els dilluns.",
      detected_places: "Puntos d'interès detectats",
      verified_sources: "Fonts Web Verificades",
      view_map: "Veure a l'app",
      verify_btn: "Verificar",
      directions_btn: "Com arribar",
      add_note_btn: "Nota",
      edit_note_btn: "Editar nota",
      save_note: "Guardar",
      cancel_note: "Cancel·lar",
      note_placeholder: "Escriu aquí les teves notes personals...",
      your_notes_label: "Les teves notes:",
      transport_labels: {
        [Transport.WALKING]: "A peu",
        [Transport.BUS]: "Bus",
        [Transport.CAR]: "Vehicle",
        [Transport.RIVER]: "Fluvial",
        [Transport.TRAIN]: "Tren",
        [Transport.BIKE]: "Bici",
        [Transport.TAXI]: "Taxi",
        [Transport.MIX]: "Combinat"
      },
      view_booking_btn: "Reservar",
      generate_image_btn: "Imatge AI",
      generating_image: "Generant...",
      check_bus_stop: "Bus",
      check_river_pier: "Embarcador",
      special_event: "Esdeveniment",
      step_by_step_btn: "Guia Pas a Pas",
      loading_instructions: "Generant passos...",
      instructions_title: "Com fer aquesta activitat:",
      nearby_attractions_btn: "A prop",
      loading_nearby: "Buscant llocs...",
      nearby_title: "També a prop (1km):",
      no_nearby_found: "No s'han trobat llocs destacats a prop.",
      copy_step: "Copiar",
      copied: "Copiat!",
      saved_success: "Viatge guardat correctament!",
      restaurants_title: "Gastronomia Recomanada",
      report_issue: "Informar d'un error"
    },
    errors: {
      generic: "S'ha produït un error inesperat.",
      api_missing: "No s'ha pogut connectar amb l'assistent."
    },
    delta_info: {
        title: "Terres de l'Ebre",
        subtitle: "Reserva de la Biosfera",
        content: `
Més enllà del Delta, les **Terres de l'Ebre** ofereixen un patrimoni excepcional riu amunt:

### 🏰 Patrimoni Històric
*   **Tortosa:** Ciutat bimil·lenària amb la **Catedral de Santa Maria**, el Castell de la Suda i els Reials Col·legis (renaixement).
*   **Miravet:** Un dels pobles més bonics de Catalunya, amb el seu imponent **Castell Templer** sobre el riu i el pas de barca tradicional.
*   **Corbera d'Ebre:** El **Poble Vell**, destruït durant la Batalla de l'Ebre, és avui un símbol de la pau.

### 🌿 Natura i Aventura
*   **El Delta:** Llacunes, arrossars i platges infinites.
*   **Els Ports:** Muntanyes salvatges ideals per al senderisme i el barranquisme.
*   **Via Verda:** Antiga via de tren convertida en ruta cicloturista que connecta la muntanya amb el mar.
`
    },
    travel_tips: {
        title: "Consells Logístics",
        subtitle: "Horarios i Mobilitat",
        content: `
*   **🕒 Horarios de Museus:** La majoria de museus i monuments (Castell de Miravet, Catedral de Tortosa) **TANQUEN ELS DILLUNS**. Planifica activitats de natura per als dilluns.
*   **🚆 Tren i Bus:** L'estació de l'Aldea connecta amb Barcelona/València. Per moure's entre pobles (Tortosa-Amposta-La Ràpita), el bus HIFE és l'opció principal.
*   **🛳️ Riu:** Els vaixells turístics tenen horaris estacionals. A l'hivern la freqüència baixa molt.
*   **🍽️ Dinar:** A l'interior (Terra Alta/Ribera), els horaris de dinar són estrictes (13:30-15:00). Reserva sempre en cap de setmana.
`
    },
    taxi_info: {
        title: "🚖 Taxis i Transports",
        content: `
Aquí tens contactes clau per moure't per les Terres de l'Ebre:

*   **Amposta:** Radio Taxi Amposta (+34 977 70 01 12)
*   **Tortosa:** Servitaxi Tortosa (+34 977 44 30 30)
*   **La Ràpita:** Taxi La Ràpita (+34 677 56 65 66)
*   **Deltebre / Riumar:** Taxis Deltebre (+34 616 46 82 82)
*   **Terra Alta (Gandesa):** Taxi Gandesa (+34 659 36 24 37)

**💰 Tarifes Estimades:**
*   Amposta ↔ Tortosa: ~25€
*   Amposta ↔ Estació l'Aldea: ~15€
*   Amposta ↔ Poble Nou (Delta): ~28€
*   Servei Via Verda (Recollida bicis): Consultar empreses locals de lloguer.
`
    }
  },
  es: {
    title: "Ebro",
    subtitle: "Descubre Amposta, Tortosa, Miravet y el Delta del Ebro.",
    beta: "Beta AI",
    generate_btn: "Generar Ruta",
    generating_btn: "Planificando...",
    share_btn: "Compartir",
    email_btn: "Email",
    pdf_btn: "PDF",
    save_btn: "Guardar",
    saved_trips_btn: "Mis Viajes",
    saved_trips_title: "Viajes Guardados",
    no_saved_trips: "Aún no tienes viajes guardados.",
    load_btn: "Cargar",
    delete_btn: "Borrar",
    create_new_btn: "Nuevo Viaje",
    section_1_title: "¿Qué experiencia buscas?",
    section_2_title: "Duración y Fecha",
    section_3_title: "Transporte",
    section_accommodation_title: "Alojamiento",
    section_4_title: "¿Algo más? (Opcional)",
    section_pois_title: "Lugares específicos y Pueblos",
    label_duration: "DURACIÓN",
    label_day: "Día",
    label_days: "Días",
    label_date: "FECHA DE INICIO (Recomendado)",
    label_date_hint: "Controlaremos días de cierre (lunes) y festivos.",
    label_river_option: "Incluir ruta río arriba",
    label_river_hint: "Añadir visita a **Tortosa** o **Miravet** vía fluvial.",
    label_extra_hint: "Ej: Viajo con niños, soy vegetariano, me interesa la fotografía...",
    label_custom_selection: "Selecciona los temas a combinar:",
    label_custom_transport_selection: "Selecciona los medios a combinar:",
    label_pois_hint: "Selecciona los lugares/pueblos que QUIERES visitar:",
    label_base_location: "¿Dónde tienes el hotel/casa?",
    themes: {
      [Theme.HISTORICAL]: { label: "Histórico (Tortosa/Miravet/Amposta)", desc: "Catedrales, Castillos Templarios y Modernismo." },
      [Theme.CIVIL_WAR]: { label: "Guerra Civil (Corbera/Terra Alta)", desc: "Trincheras, Pueblo Viejo y espacios de memoria." },
      [Theme.GEOLOGICAL]: { label: "Geológico y Cuevas", desc: "Cuevas Meravelles, Ports y Delta." },
      [Theme.NATURE]: { label: "Naturaleza y Delta", desc: "Avistamiento de aves, lagunas y playas vírgenes." },
      [Theme.GASTRONOMIC]: { label: "Gastronómico y Vinos", desc: "Arroz del Delta, clotxa y vinos de la Terra Alta." },
      [Theme.CUSTOM]: { label: "Personalizado (Mix)", desc: "Crea tu propia aventura combinando temas." }
    },
    transports: {
      [Transport.WALKING]: "A pie (En pueblos)",
      [Transport.BUS]: "Autobús (Hife)",
      [Transport.CAR]: "Coche propio",
      [Transport.RIVER]: "Barco / Transporte Fluvial",
      [Transport.TRAIN]: "Tren (Rodalies/Media Distancia)",
      [Transport.BIKE]: "Bicicleta / Vía Verde",
      [Transport.TAXI]: "Taxi (Privado)",
      [Transport.MIX]: "Mix / Combinado"
    },
    accommodations: {
        [AccommodationMode.BASE]: { label: "Campo Base (Fijo)", desc: "Dormir siempre en el mismo sitio." },
        [AccommodationMode.ROUTE]: { label: "Ruta (Itinerante)", desc: "Dormir en distintos pueblos." }
    },
    results: {
      itinerary_title: "Tu Itinerario",
      scheduled_date: "Fecha programada",
      suggested_route: "Ruta sugerida",
      river_note_upriver: "Ruta que conecta el Delta con el interior (Tortosa/Miravet).",
      river_note_local: "Mostrando accesibilidad desde el embarcadero detectado.",
      view_full_river_route: "Ver ruta fluvial completa",
      pier_locations: "Embarcaderos clave",
      river_route_title: "Ruta Fluvial Ebro",
      plan_title: "Plan de Viaje",
      day: "Día",
      no_activities: "No hay actividades programadas para este día.",
      bookings_title: "Reservas y Disponibilidad",
      bookings_subtitle: "Enlaces rápidos para entradas y mesas",
      web_info: "Web Info",
      book_table: "Reservar Mesa",
      search_tickets: "Buscar Tickets",
      verify_warning: "* Importante: Verifica siempre los horarios. Muchos museos cierran los lunes.",
      detected_places: "Puntos de interés detectados",
      verified_sources: "Fuentes Web Verificadas",
      view_map: "Ver en app",
      verify_btn: "Verificar",
      directions_btn: "Cómo llegar",
      add_note_btn: "Nota",
      edit_note_btn: "Editar nota",
      save_note: "Guardar",
      cancel_note: "Cancelar",
      note_placeholder: "Escribe aquí tus notas personales...",
      your_notes_label: "Tus notas:",
      transport_labels: {
        [Transport.WALKING]: "A pie",
        [Transport.BUS]: "Bus",
        [Transport.CAR]: "Vehículo",
        [Transport.RIVER]: "Fluvial",
        [Transport.TRAIN]: "Tren",
        [Transport.BIKE]: "Bici",
        [Transport.TAXI]: "Taxi",
        [Transport.MIX]: "Combinado"
      },
      view_booking_btn: "Reservar",
      generate_image_btn: "Imagen AI",
      generating_image: "Generando...",
      check_bus_stop: "Bus",
      check_river_pier: "Embarcadero",
      special_event: "Evento",
      step_by_step_btn: "Paso a Paso",
      loading_instructions: "Generando guía...",
      instructions_title: "Cómo realizar esta actividad:",
      nearby_attractions_btn: "Cerca",
      loading_nearby: "Buscando lugares...",
      nearby_title: "También cerca (1km):",
      no_nearby_found: "No se han encontrado lugares destacados cerca.",
      copy_step: "Copiar",
      copied: "¡Copiado!",
      saved_success: "¡Viaje guardado correctamente!",
      restaurants_title: "Gastronomía Recomendada",
      report_issue: "Reportar un problema"
    },
    errors: {
      generic: "Ocurrió un error inesperado.",
      api_missing: "No se pudo conectar con el asistente."
    },
    delta_info: {
        title: "Terres de l'Ebre",
        subtitle: "Reserva de la Biosfera",
        content: `
Más allá del Delta, las **Terres de l'Ebre** ofrecen un patrimonio excepcional río arriba:

### 🏰 Patrimonio Histórico
*   **Tortosa:** Ciudad bimilenaria con la **Catedral de Santa María**, el Castillo de la Suda y los Reales Colegios (renacimiento).
*   **Miravet:** Uno de los pueblos más bonitos de Cataluña, con su imponente **Castillo Templario** sobre el río y el paso de barca tradicional.
*   **Corbera d'Ebre:** El **Pueblo Viejo**, destruido durante la Batalla del Ebro, es hoy un símbolo de la paz.

### 🌿 Naturaleza y Aventura
*   **El Delta:** Lagunas, arrozales y playas infinitas.
*   **Els Ports:** Montañas salvajes ideales para el senderismo y el barranquismo.
*   **Vía Verde:** Antigua vía de tren convertida en ruta cicloturista que conecta la montaña con el mar.
`
    },
    travel_tips: {
        title: "Consejos Logísticos",
        subtitle: "Horarios y Movilidad",
        content: `
*   **🕒 Horarios de Museos:** La mayoría de museos y monumentos (Castillo de Miravet, Catedral de Tortosa) **CIERRAN LOS LUNES**. Planifica actividades de naturaleza para los lunes.
*   **🚆 Tren y Bus:** La estación de l'Aldea conecta con Barcelona/Valencia. Para moverse entre pueblos (Tortosa-Amposta-La Ràpita), el bus HIFE es la opción principal.
*   **🛳️ Río:** Los barcos turísticos tienen horarios estacionales. En invierno la frecuencia baja mucho.
*   **🍽️ Comida:** En el interior (Terra Alta/Ribera), los horarios de comida son estrictos (13:30-15:00). Reserva siempre en fin de semana.
`
    },
    taxi_info: {
        title: "🚖 Taxis y Transporte",
        content: `
Contactos clave para moverte por las Terres de l'Ebre:

*   **Amposta:** Radio Taxi Amposta (+34 977 70 01 12)
*   **Tortosa:** Servitaxi Tortosa (+34 977 44 30 30)
*   **La Ràpita:** Taxi La Ràpita (+34 677 56 65 66)
*   **Deltebre / Riumar:** Taxis Deltebre (+34 616 46 82 82)
*   **Terra Alta (Gandesa):** Taxi Gandesa (+34 659 36 24 37)

**💰 Tarifes Estimades:**
*   Amposta ↔ Tortosa: ~25€
*   Amposta ↔ Estación l'Aldea: ~15€
*   Amposta ↔ Poble Nou (Delta): ~28€
*   Servicio Vía Verde (Recogida bicis): Consultar alquileres locales.
`
    }
  },
  en: {
    title: "Ebro",
    subtitle: "Discover Amposta, Tortosa, Miravet and the Ebro Delta.",
    beta: "Beta AI",
    generate_btn: "Generate Route",
    generating_btn: "Planning...",
    share_btn: "Share",
    email_btn: "Email",
    pdf_btn: "PDF",
    save_btn: "Save",
    saved_trips_btn: "My Trips",
    saved_trips_title: "Saved Trips",
    no_saved_trips: "You don't have any saved trips yet.",
    load_btn: "Load",
    delete_btn: "Delete",
    create_new_btn: "New Trip",
    section_1_title: "What experience are you looking for?",
    section_2_title: "Duration and Date",
    section_3_title: "Transport",
    section_accommodation_title: "Accommodation",
    section_4_title: "Anything else? (Optional)",
    section_pois_title: "Specific Places and Villages",
    label_duration: "DURATION",
    label_day: "Day",
    label_days: "Days",
    label_date: "START DATE (Recommended)",
    label_date_hint: "We will check for closing days (Mondays) and holidays.",
    label_river_option: "Include upriver route",
    label_river_hint: "Add visit to **Tortosa** or **Miravet** via river.",
    label_extra_hint: "Ex: I'm traveling with kids, I'm vegetarian, interested in photography...",
    label_custom_selection: "Select themes to combine:",
    label_custom_transport_selection: "Select modes to combine:",
    label_pois_hint: "Select the places/villages you WANT to visit:",
    label_base_location: "Where is your hotel/house?",
    themes: {
      [Theme.HISTORICAL]: { label: "Historical (Tortosa/Miravet/Amposta)", desc: "Cathedrals, Templar Castles and Modernism." },
      [Theme.CIVIL_WAR]: { label: "Civil War (Corbera/Terra Alta)", desc: "Trenches, Old Village and memory spaces." },
      [Theme.GEOLOGICAL]: { label: "Geological and Caves", desc: "Meravelles Caves, Ports and Delta." },
      [Theme.NATURE]: { label: "Nature and Delta", desc: "Birdwatching, lagoons and virgin beaches." },
      [Theme.GASTRONOMIC]: { label: "Gastronomic and Wine", desc: "Delta Rice, clotxa and Terra Alta wines." },
      [Theme.CUSTOM]: { label: "Custom (Mix)", desc: "Create your own adventure combining themes." }
    },
    transports: {
      [Transport.WALKING]: "Walking (In villages)",
      [Transport.BUS]: "Bus (Hife)",
      [Transport.CAR]: "Own Car",
      [Transport.RIVER]: "Boat / River Transport",
      [Transport.TRAIN]: "Train (Regional/Medium Distance)",
      [Transport.BIKE]: "Bicycle / Greenway",
      [Transport.TAXI]: "Taxi (Private)",
      [Transport.MIX]: "Mix / Combined"
    },
    accommodations: {
        [AccommodationMode.BASE]: { label: "Base Camp (Fixed)", desc: "Sleep in the same place every night." },
        [AccommodationMode.ROUTE]: { label: "Route (Moving)", desc: "Sleep in different villages." }
    },
    results: {
      itinerary_title: "Your Itinerary",
      scheduled_date: "Scheduled date",
      suggested_route: "Suggested route",
      river_note_upriver: "Route connecting the Delta with the interior (Tortosa/Miravet).",
      river_note_local: "Showing accessibility from the detected pier.",
      view_full_river_route: "View full river route",
      pier_locations: "Key piers",
      river_route_title: "Ebro River Route",
      plan_title: "Trip Plan",
      day: "Day",
      no_activities: "No activities scheduled for this day.",
      bookings_title: "Bookings and Availability",
      bookings_subtitle: "Quick links for tickets and tables",
      web_info: "Web Info",
      book_table: "Book Table",
      search_tickets: "Search Tickets",
      verify_warning: "* Important: Always verify schedules. Many museums close on Mondays.",
      detected_places: "Detected points of interest",
      verified_sources: "Verified Web Sources",
      view_map: "View in app",
      verify_btn: "Verify",
      directions_btn: "Get directions",
      add_note_btn: "Note",
      edit_note_btn: "Edit note",
      save_note: "Save",
      cancel_note: "Cancel",
      note_placeholder: "Write your personal notes here...",
      your_notes_label: "Your notes:",
      transport_labels: {
        [Transport.WALKING]: "Walking",
        [Transport.BUS]: "Bus",
        [Transport.CAR]: "Car",
        [Transport.RIVER]: "River",
        [Transport.TRAIN]: "Train",
        [Transport.BIKE]: "Bike",
        [Transport.TAXI]: "Taxi",
        [Transport.MIX]: "Combined"
      },
      view_booking_btn: "Book",
      generate_image_btn: "AI Image",
      generating_image: "Generating...",
      check_bus_stop: "Bus",
      check_river_pier: "Pier",
      special_event: "Event",
      step_by_step_btn: "Step by Step Guide",
      loading_instructions: "Generating steps...",
      instructions_title: "How to do this activity:",
      nearby_attractions_btn: "Nearby",
      loading_nearby: "Searching places...",
      nearby_title: "Also nearby (1km):",
      no_nearby_found: "No featured places found nearby.",
      copy_step: "Copy",
      copied: "Copied!",
      saved_success: "Trip saved successfully!",
      restaurants_title: "Recommended Dining",
      report_issue: "Report issue"
    },
    errors: {
      generic: "An unexpected error occurred.",
      api_missing: "Could not connect to the assistant."
    },
    delta_info: {
        title: "Terres de l'Ebre",
        subtitle: "Biosphere Reserve",
        content: `
Beyond the Delta, **Terres de l'Ebre** offers exceptional heritage upriver:

### 🏰 Historical Heritage
*   **Tortosa:** Two-thousand-year-old city with **Saint Mary's Cathedral**, the Suda Castle and the Royal Colleges (renaissance).
*   **Miravet:** One of the most beautiful villages in Catalonia, with its imposing **Templar Castle** over the river and the traditional ferry boat.
*   **Corbera d'Ebre:** The **Old Village**, destroyed during the Battle of the Ebro, is today a symbol of peace.

### 🌿 Nature and Adventure
*   **The Delta:** Lagoons, rice fields and endless beaches.
*   **Els Ports:** Wild mountains ideal for hiking and canyoning.
*   **Greenway:** Old railway line converted into a cycling route connecting the mountains with the sea.
`
    },
    travel_tips: {
        title: "Logistics Tips",
        subtitle: "Schedules and Mobility",
        content: `
*   **🕒 Museum Hours:** Most museums and monuments (Miravet Castle, Tortosa Cathedral) **CLOSE ON MONDAYS**. Plan nature activities for Mondays.
*   **🚆 Train and Bus:** L'Aldea station connects with Barcelona/Valencia. To move between towns (Tortosa-Amposta-La Ràpita), the HIFE bus is the main option.
*   **🛳️ River:** Tourist boats have seasonal schedules. In winter, frequency drops significantly.
*   **🍽️ Lunch:** In the interior (Terra Alta/Ribera), lunch hours are strict (13:30-15:00). Always book on weekends.
`
    },
    taxi_info: {
        title: "🚖 Taxis and Transport",
        content: `
Key contacts for moving around Terres de l'Ebre:

*   **Amposta:** Radio Taxi Amposta (+34 977 70 01 12)
*   **Tortosa:** Servitaxi Tortosa (+34 977 44 30 30)
*   **La Ràpita:** Taxi La Ràpita (+34 677 56 65 66)
*   **Deltebre / Riumar:** Taxis Deltebre (+34 616 46 82 82)
*   **Terra Alta (Gandesa):** Taxi Gandesa (+34 659 36 24 37)

**💰 Estimated Fares:**
*   Amposta ↔ Tortosa: ~25€
*   Amposta ↔ L'Aldea Station: ~15€
*   Amposta ↔ Poble Nou (Delta): ~28€
*   Greenway Service (Bike pickup): Consult local rental companies.
`
    }
  }
};
