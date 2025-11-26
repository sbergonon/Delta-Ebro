

import { Theme, Transport, Language } from './types';

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
  [Transport.MIX]: '🔀'
};

export const DEFAULT_PREFERENCES = {
  language: 'ca' as Language,
  theme: Theme.HISTORICAL,
  customThemes: [] as Theme[],
  duration: 1,
  transport: Transport.WALKING,
  customTransports: [] as Transport[],
  startDate: '',
  includeUpriver: false
};

interface Translation {
  title: string;
  subtitle: string;
  beta: string;
  generate_btn: string;
  generating_btn: string;
  share_btn: string;
  email_btn: string;
  pdf_btn: string;
  create_new_btn: string;
  section_1_title: string;
  section_2_title: string;
  section_3_title: string;
  section_4_title: string;
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
  themes: Record<Theme, { label: string; desc: string }>;
  transports: Record<Transport, string>;
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
}

export const TRANSLATIONS: Record<Language, Translation> = {
  ca: {
    title: "Amposta",
    subtitle: "La teva guia intel·ligent per descobrir Amposta i el Delta de l'Ebre.",
    beta: "Beta AI",
    generate_btn: "Generar Ruta",
    generating_btn: "Planificant...",
    share_btn: "Copiar Enllaç",
    email_btn: "Enviar per Email",
    pdf_btn: "Guardar PDF",
    create_new_btn: "Crear-ne un altre",
    section_1_title: "Quina experiència busques?",
    section_2_title: "Durada i Data",
    section_3_title: "Transport",
    section_4_title: "Alguna cosa més? (Opcional)",
    label_duration: "DURADA",
    label_day: "Dia",
    label_days: "Dies",
    label_date: "DATA D'INICI",
    label_date_hint: "Inclourem esdeveniments locals si coincideixen.",
    label_river_option: "Incloure ruta riu amunt",
    label_river_hint: "Afegir visita a **Tortosa** o **Miravet** via fluvial.",
    label_extra_hint: "Ex: Viatjo amb nens, sóc vegetarià, m'interessa la fotografia...",
    label_custom_selection: "Selecciona els temes a combinar:",
    label_custom_transport_selection: "Selecciona els mitjans a combinar:",
    themes: {
      [Theme.HISTORICAL]: { label: "Històric i Cultural", desc: "Pont Penjant, Castell i nucli antic." },
      [Theme.CIVIL_WAR]: { label: "Guerra Civil", desc: "Rutes de trinxeres, búnquers i memòria històrica." },
      [Theme.GEOLOGICAL]: { label: "Geològic", desc: "Formacions rocoses, sediments del Delta i paisatges." },
      [Theme.NATURE]: { label: "Monuments Naturals", desc: "Observació d'aus, l'Encanyissada i platges verges." },
      [Theme.GASTRONOMIC]: { label: "Gastronòmic", desc: "Arròs del Delta, marisc fresc i cuina de mercat." },
      [Theme.CUSTOM]: { label: "Personalitzat (Mix)", desc: "Crea la teva pròpia aventura combinant temes." }
    },
    transports: {
      [Transport.WALKING]: "A peu / Transport Públic",
      [Transport.BUS]: "Autobús (Hife/Locals)",
      [Transport.CAR]: "Cotxe propi",
      [Transport.RIVER]: "Vaixell / Transport Fluvial",
      [Transport.TRAIN]: "Tren (Estació l'Aldea)",
      [Transport.BIKE]: "Bicicleta / Cicloturismo",
      [Transport.MIX]: "Mix / Combinat"
    },
    results: {
      itinerary_title: "El teu Itinerari",
      scheduled_date: "Data programada",
      suggested_route: "Ruta suggerida",
      river_note_upriver: "Mostrant ruta aproximada del riu entre Amposta i localitats històriques (Tortosa/Miravet). Consulta horaris.",
      river_note_local: "Mostrant accessibilitat des de l'embarcador detectat cap als punts d'interès.",
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
      verify_warning: "* Es recomana verificar preus i horaris directament als llocs oficials.",
      detected_places: "Punts d'interès detectats",
      verified_sources: "Fonts Web Verificades",
      view_map: "Veure a l'app",
      verify_btn: "Verificar info",
      directions_btn: "Com arribar",
      add_note_btn: "Afegir nota",
      edit_note_btn: "Editar nota",
      save_note: "Guardar",
      cancel_note: "Cancel·lar",
      note_placeholder: "Escriu aquí les teves notes personals...",
      your_notes_label: "Les teves notes:",
      transport_labels: {
        [Transport.WALKING]: "A peu",
        [Transport.BUS]: "Bus",
        [Transport.CAR]: "Vehicle",
        [Transport.RIVER]: "Fluvial + A peu",
        [Transport.TRAIN]: "Tren + Enllaç",
        [Transport.BIKE]: "Bici",
        [Transport.MIX]: "Combinat"
      },
      view_booking_btn: "Info & Reserves",
      generate_image_btn: "Generar Imatge AI",
      generating_image: "Generant...",
      check_bus_stop: "Veure parada bus",
      check_river_pier: "Veure embarcador",
      special_event: "Esdeveniment Especial"
    },
    errors: {
      generic: "S'ha produït un error inesperat.",
      api_missing: "No s'ha pogut connectar amb l'assistent."
    },
    delta_info: {
        title: "Descobreix el Delta de l'Ebre",
        subtitle: "Natura, tradició i paisatges únics",
        content: `
El **Delta de l'Ebre** és l'hàbitat aquàtic més important de la Mediterrània occidental, després de la Camarga (França) i el segon d'Espanya, després del Parc Nacional de Doñana.

### 🌿 Ecosistemes Únics
El Delta ofereix una varietat de paisatges que canvien amb les estacions:
*   **Llacunes:** Com **l'Encanyissada** o la **Tancada**, vitals per a la pesca i la vida salvatge.
*   **Platges:** Extenses i verges com la del **Trabucador** o la **Marquesa**.
*   **Els Ullals:** Petites basses d'aigua dolça subterrània (com els de Baltasar).

### 🔭 Activitats Destacades
*   **Observació d'aus (Birdwatching):** Més de 300 espècies d'aus, incloent la colònia de **flamencs** més emblemàtica.
*   **Creuers Fluvials:** Navega per la desembocadura fins a l'Illa de Buda per gaudir d'una perspectiva única del riu i el mar.
*   **Cicloturisme:** El terreny totalment pla fa que recórrer el Delta en bicicleta sigui una activitat perfecta per a totes les edats.
*   **Gastronomia:** No marxis sense tastar un bon **arròs del Delta**, l'anguila fumada o els musclos del terreny.
`
    },
    travel_tips: {
        title: "Consells de Viatge",
        subtitle: "Informació pràctica per a la teva visita",
        content: `
*   **🦟 Mosquits:** Imprescindible portar repel·lent fort, especialment si visites el Delta a l'estiu o durant la sortida/posta de sol.
*   **📅 Millor època:** Primavera (abril-maig) i tardor (setembre-octubre) són ideals per a l'observació d'aus. L'estiu és perfecte per gaudir de les platges.
*   **🍽️ Horaris:** Els dinars solen ser entre les 13:30 i 15:30, i els sopars entre les 21:00 i 23:00. Moltes cuines tanquen fora d'aquests horaris.
*   **🗣️ Idioma:** Es parla tant català com castellà. Un senzill "Bon dia" o "Gràcies" sempre és ben rebut pels locals.
*   **☀️ Protecció:** El sol és molt fort als espais oberts del Delta on no hi ha ombres naturals. Porta sempre gorra, ulleres de sol i protecció solar.
`
    }
  },
  es: {
    title: "Amposta",
    subtitle: "Tu guía inteligente para descubrir Amposta y el Delta del Ebro.",
    beta: "Beta AI",
    generate_btn: "Generar Ruta",
    generating_btn: "Planificando...",
    share_btn: "Copiar Enlace",
    email_btn: "Enviar por Email",
    pdf_btn: "Guardar PDF",
    create_new_btn: "Crear otro",
    section_1_title: "¿Qué experiencia buscas?",
    section_2_title: "Duración y Fecha",
    section_3_title: "Transporte",
    section_4_title: "¿Algo más? (Opcional)",
    label_duration: "DURACIÓN",
    label_day: "Día",
    label_days: "Días",
    label_date: "FECHA DE INICIO",
    label_date_hint: "Incluiremos eventos locales si coinciden.",
    label_river_option: "Incluir ruta río arriba",
    label_river_hint: "Añadir visita a **Tortosa** o **Miravet** vía fluvial.",
    label_extra_hint: "Ej: Viajo con niños, soy vegetariano, me interesa la fotografía...",
    label_custom_selection: "Selecciona los temas a combinar:",
    label_custom_transport_selection: "Selecciona los medios a combinar:",
    themes: {
      [Theme.HISTORICAL]: { label: "Histórico y Cultural", desc: "Puente Colgante, Castillo y casco antiguo." },
      [Theme.CIVIL_WAR]: { label: "Guerra Civil", desc: "Rutas de trincheras, búnkeres y memoria histórica." },
      [Theme.GEOLOGICAL]: { label: "Geológico", desc: "Formaciones rocosas, sedimentos del Delta y paisajes." },
      [Theme.NATURE]: { label: "Monumentos Naturales", desc: "Avistamiento de aves, la Encanyissada y playas vírgenes." },
      [Theme.GASTRONOMIC]: { label: "Gastronómico", desc: "Arroz del Delta, mariscos frescos y cocina de mercado." },
      [Theme.CUSTOM]: { label: "Personalizado (Mix)", desc: "Crea tu propia aventura combinando temas." }
    },
    transports: {
      [Transport.WALKING]: "A pie / Transporte Público",
      [Transport.BUS]: "Autobús (Hife/Locals)",
      [Transport.CAR]: "Coche propio",
      [Transport.RIVER]: "Barco / Transporte Fluvial",
      [Transport.TRAIN]: "Tren (Estación l'Aldea)",
      [Transport.BIKE]: "Bicicleta / Cicloturismo",
      [Transport.MIX]: "Mix / Combinado"
    },
    results: {
      itinerary_title: "Tu Itinerario",
      scheduled_date: "Fecha programada",
      suggested_route: "Ruta sugerida",
      river_note_upriver: "Mostrando ruta aproximada del río entre Amposta y localidades históricas (Tortosa/Miravet). Consulta horarios.",
      river_note_local: "Mostrando accesibilidad desde el embarcadero detectado hacia los puntos de interés.",
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
      verify_warning: "* Se recomienda verificar precios y horarios directamente en los sitios oficiales.",
      detected_places: "Puntos de interés detectados",
      verified_sources: "Fuentes Web Verificadas",
      view_map: "Ver en app",
      verify_btn: "Verificar info",
      directions_btn: "Cómo llegar",
      add_note_btn: "Añadir nota",
      edit_note_btn: "Editar nota",
      save_note: "Guardar",
      cancel_note: "Cancelar",
      note_placeholder: "Escribe aquí tus notas personales...",
      your_notes_label: "Tus notas:",
      transport_labels: {
        [Transport.WALKING]: "A pie",
        [Transport.BUS]: "Bus",
        [Transport.CAR]: "Vehículo",
        [Transport.RIVER]: "Fluvial + A pie",
        [Transport.TRAIN]: "Tren + Enlace",
        [Transport.BIKE]: "Bici",
        [Transport.MIX]: "Combinado"
      },
      view_booking_btn: "Info y Reservas",
      generate_image_btn: "Generar Imagen AI",
      generating_image: "Generando...",
      check_bus_stop: "Ver parada bus",
      check_river_pier: "Ver embarcadero",
      special_event: "Evento Especial"
    },
    errors: {
      generic: "Ocurrió un error inesperado.",
      api_missing: "No se pudo conectar con el asistente."
    },
    delta_info: {
        title: "Descubre el Delta del Ebro",
        subtitle: "Naturaleza, tradición y paisajes únicos",
        content: `
El **Delta del Ebro** es el hábitat acuático más importante del Mediterráneo occidental, después de la Camarga (Francia) y el segundo de España, tras el Parque Nacional de Doñana.

### 🌿 Ecosistemas Únicos
El Delta ofrece una variedad de paisajes que cambian con las estaciones:
*   **Lagunas:** Como **l'Encanyissada** o la **Tancada**, vitales para la pesca y la vida salvaje.
*   **Playas:** Extensas y vírgenes como la del **Trabucador** o la **Marquesa**.
*   **Els Ullals:** Pequeñas balsas de agua dulce subterránea (como los de Baltasar).

### 🔭 Actividades Destacadas
*   **Avistamiento de aves (Birdwatching):** Más de 300 especies de aves, incluyendo la colonia de **flamencos** más emblemática.
*   **Cruceros Fluviales:** Navega por la desembocadura hasta la Isla de Buda para disfrutar de una perspectiva única del río y el mar.
*   **Cicloturismo:** El terreno totalmente llano hace que recorrer el Delta en bicicleta sea una actividad perfecta para todas las edades.
*   **Gastronomía:** No te vayas sin probar un buen **arroz del Delta**, la anguila ahumada o los mejillones del terreno.
`
    },
    travel_tips: {
        title: "Consejos de Viaje",
        subtitle: "Información práctica para tu visita",
        content: `
*   **🦟 Mosquitos:** Es imprescindible llevar repelente fuerte, especialmente si visitas el Delta en verano o durante el amanecer/atardecer.
*   **📅 Mejor época:** Primavera (abril-mayo) y otoño (septiembre-octubre) son ideales para observar aves. El verano es perfecto para disfrutar de las playas.
*   **🍽️ Horarios:** Las comidas suelen ser entre las 13:30 y 15:30, y las cenas entre las 21:00 y 23:00. Muchas cocinas cierran fuera de estos horarios.
*   **🗣️ Idioma:** Se habla tanto catalán como castellano. Un sencillo "Bon dia" o "Gracias" siempre es bien recibido por los locales.
*   **☀️ Protección:** El sol es muy fuerte en los espacios abiertos del Delta donde no hay sombras naturales. Lleva siempre gorra, gafas de sol y protección solar.
`
    }
  },
  en: {
    title: "Amposta",
    subtitle: "Your intelligent guide to discover Amposta and the Ebro Delta.",
    beta: "Beta AI",
    generate_btn: "Generate Route",
    generating_btn: "Planning...",
    share_btn: "Copy Link",
    email_btn: "Send via Email",
    pdf_btn: "Save as PDF",
    create_new_btn: "Create new",
    section_1_title: "What experience are you looking for?",
    section_2_title: "Duration & Date",
    section_3_title: "Transport",
    section_4_title: "Anything else? (Optional)",
    label_duration: "DURATION",
    label_day: "Day",
    label_days: "Days",
    label_date: "START DATE",
    label_date_hint: "We will include local events if they match.",
    label_river_option: "Include upriver route",
    label_river_hint: "Add visit to **Tortosa** or **Miravet** via river.",
    label_extra_hint: "Ex: Traveling with kids, vegetarian, interested in photography...",
    label_custom_selection: "Select themes to combine:",
    label_custom_transport_selection: "Select transport modes to combine:",
    themes: {
      [Theme.HISTORICAL]: { label: "Historical & Cultural", desc: "Suspension Bridge, Castle and Old Town." },
      [Theme.CIVIL_WAR]: { label: "Civil War", desc: "Trenches, bunkers and historical memory routes." },
      [Theme.GEOLOGICAL]: { label: "Geological", desc: "Rock formations, Delta sediments and landscapes." },
      [Theme.NATURE]: { label: "Nature Monuments", desc: "Birdwatching, Encanyissada lagoon and virgin beaches." },
      [Theme.GASTRONOMIC]: { label: "Gastronomic", desc: "Delta rice, fresh seafood and market cuisine." },
      [Theme.CUSTOM]: { label: "Custom (Mix)", desc: "Create your own adventure by combining themes." }
    },
    transports: {
      [Transport.WALKING]: "Walking / Public Transport",
      [Transport.BUS]: "Bus (Hife/Local)",
      [Transport.CAR]: "Own Car",
      [Transport.RIVER]: "Boat / River Transport",
      [Transport.TRAIN]: "Train (Station l'Aldea)",
      [Transport.BIKE]: "Bicycle / Cycling",
      [Transport.MIX]: "Mix / Combined"
    },
    results: {
      itinerary_title: "Your Itinerary",
      scheduled_date: "Scheduled date",
      suggested_route: "Suggested route",
      river_note_upriver: "Showing approximate river route between Amposta and historical towns (Tortosa/Miravet). Check schedules.",
      river_note_local: "Showing accessibility from the detected pier to points of interest.",
      view_full_river_route: "View full river route",
      pier_locations: "Key pier locations",
      river_route_title: "Ebro River Route",
      plan_title: "Travel Plan",
      day: "Day",
      no_activities: "No activities scheduled for this day.",
      bookings_title: "Bookings & Availability",
      bookings_subtitle: "Quick links for tickets and tables",
      web_info: "Web Info",
      book_table: "Book Table",
      search_tickets: "Search Tickets",
      verify_warning: "* It is recommended to verify prices and schedules on official sites.",
      detected_places: "Detected Points of Interest",
      verified_sources: "Verified Web Sources",
      view_map: "View in app",
      verify_btn: "Verify info",
      directions_btn: "Get directions",
      add_note_btn: "Add note",
      edit_note_btn: "Edit note",
      save_note: "Save",
      cancel_note: "Cancel",
      note_placeholder: "Write your personal notes here...",
      your_notes_label: "Your notes:",
      transport_labels: {
        [Transport.WALKING]: "Walking",
        [Transport.BUS]: "Bus",
        [Transport.CAR]: "Car",
        [Transport.RIVER]: "River + Walking",
        [Transport.TRAIN]: "Train + Link",
        [Transport.BIKE]: "Bike",
        [Transport.MIX]: "Combined"
      },
      view_booking_btn: "Info & Booking",
      generate_image_btn: "Generate AI Image",
      generating_image: "Generating...",
      check_bus_stop: "Check bus stop",
      check_river_pier: "Check river pier",
      special_event: "Special Event"
    },
    errors: {
      generic: "An unexpected error occurred.",
      api_missing: "Could not connect to the travel assistant."
    },
    delta_info: {
        title: "Discover the Ebro Delta",
        subtitle: "Nature, tradition, and unique landscapes",
        content: `
The **Ebro Delta** is the most important aquatic habitat in the Western Mediterranean, after the Camargue (France), and the second in Spain, after Doñana National Park.

### 🌿 Unique Ecosystems
The Delta offers a variety of landscapes that change with the seasons:
*   **Lagoons:** Such as **l'Encanyissada** or **la Tancada**, vital for fishing and wildlife.
*   **Beaches:** Extensive and virgin beaches like **Trabucador** or **Marquesa**.
*   **Els Ullals:** Small freshwater pools from underground springs (like Baltasar's).

### 🔭 Highlighted Activities
*   **Birdwatching:** More than 300 bird species, including the iconic **flamingo** colony.
*   **River Cruises:** Sail through the river mouth to Buda Island to enjoy a unique perspective of the river and the sea.
*   **Cycling:** The completely flat terrain makes cycling through the Delta a perfect activity for all ages.
*   **Gastronomy:** Don't leave without tasting a good **Delta rice**, smoked eel, or local mussels.
`
    },
    travel_tips: {
        title: "Travel Tips",
        subtitle: "Practical information for your visit",
        content: `
*   **🦟 Mosquitoes:** Strong repellent is essential, especially if visiting the Delta in summer or at sunrise/sunset.
*   **📅 Best Time:** Spring (April-May) and Autumn (September-October) are ideal for birdwatching. Summer is perfect for enjoying the beaches.
*   **🍽️ Timings:** Lunch is usually between 1:30 PM and 3:30 PM, and dinner between 9:00 PM and 11:00 PM. Many kitchens close outside these hours.
*   **🗣️ Language:** Both Catalan and Spanish are spoken. A simple "Bon dia" (Good morning) or "Gracias" is always welcomed by locals.
*   **☀️ Protection:** The sun is very strong in the open Delta where there are no natural shades. Always bring a hat, sunglasses, and sunscreen.
`
    }
  }
};