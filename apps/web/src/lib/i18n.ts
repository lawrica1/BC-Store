export type Locale = "fr" | "en";

export const dictionaries = {
  fr: {
    nav: {
      home: "Accueil",
      shop: "Boutique",
      repair: "Réparation",
      services: "Services",
      other: "Autre",
      admin: "Admin",
      support: "Support"
    },
    hero: {
      eyebrow: "Boutique + services techniques",
      title: "Bienvenue chez BC Store",
      subtitle: "La Tech à votre porte.",
      copy: "Achetez vos accessoires, téléphones et ordinateurs, puis réservez une réparation ou une installation dans la même expérience.",
      buy: "Acheter maintenant",
      repair: "Réparer un appareil"
    },
    heroSlides: {
      repair: {
        eyebrow: "Service technique",
        title: "Un souci avec votre appareil ?",
        subtitle: "On répare vite, bien.",
        copy: "Diagnostic en boutique ou technicien à domicile, selon ce qui vous arrange.",
        cta: "Réserver une réparation"
      },
      services: {
        eyebrow: "Installations pro",
        title: "Caméra, électricité, sonorisation",
        subtitle: "On s'occupe de tout.",
        copy: "Devis gratuit pour vos installations techniques, avec garantie et intervention rapide.",
        cta: "Demander un devis"
      }
    },
    utilityBar: {
      contact: "Contactez-nous",
      helpCenter: "Centre d'aide",
      tagline: "Livraison à Douala"
    },
    categoryTags: {
      CASQUE: "Populaire",
      ECOUTEUR: "Compact",
      CHARGEUR: "Charge rapide",
      POWERBANK: "Longue autonomie",
      TELEPHONE: "Nouveau",
      ORDINATEUR: "Pro"
    },
    categories: {
      CASQUE: "Casques",
      ECOUTEUR: "Écouteurs",
      CHARGEUR: "Chargeurs",
      POWERBANK: "Powerbanks",
      TELEPHONE: "Téléphones",
      ORDINATEUR: "Ordinateurs",
      AUTRE: "Autre",
      ALL: "Tous"
    },
    shop: {
      title: "Boutique",
      copy: "Produits populaires avec stock, prix et panier persistant.",
      add: "Ajouter au panier",
      view: "Voir le produit",
      stock: "En stock",
      out: "Rupture",
      cart: "Panier",
      checkout: "Commander",
      clear: "Vider le panier",
      empty: "Votre panier est vide.",
      total: "Total",
      filters: "Filtres",
      category: "Catégorie",
      price: "Prix",
      brand: "Marque",
      breadcrumb: "Accueil > Boutique",
      description: "Description",
      specifications: "Spécifications techniques",
      reviews: "Avis clients",
      quantity: "Quantité",
      saleBadge: "Solde -{percent}%",
      resetFilters: "Réinitialiser les filtres",
      sortTopRated: "Mieux notés",
      sortPriceAsc: "Prix croissant",
      sortPriceDesc: "Prix décroissant",
      searchBrands: "Rechercher une marque",
      priceMin: "Min",
      priceMax: "Max"
    },
    checkout: {
      title: "Finaliser la commande",
      delivery: "Livraison",
      payment: "Paiement",
      confirmation: "Confirmation",
      address: "Adresse de livraison",
      promo: "Code promo",
      apply: "Appliquer",
      card: "Carte",
      mobileMoney: "Mobile Money",
      orangeMoney: "Orange Money",
      receiverLabel: "Numéro de paiement",
      receiverHint: "Envoyez le paiement à ce numéro. La commande gardera ce numéro comme référence de suivi.",
      confirm: "Confirmer la commande",
      summary: "Résumé",
      success: "Commande confirmée. Envoyez le paiement au {phone}; BC Store suivra la transaction avec ce numéro.",
      deliveryMethod: "Mode de réception",
      pickup: "Retrait en boutique",
      pickupHint: "Récupérez votre commande à la boutique BC Store, gratuitement.",
      deliverToAddress: "Livraison à l'adresse",
      deliveryFee: "Frais de livraison"
    },
    repair: {
      title: "Diagnostic & Réparation Express",
      copy: "Choisissez votre appareil, décrivez la panne, puis sélectionnez boutique ou domicile.",
      inStore: "Passer à la boutique",
      atHome: "Technicien à domicile",
      submit: "Envoyer la demande de réparation",
      sent: "Ticket créé. Un spécialiste vous contactera sous 24h.",
      banner: "Priorité réparation",
      storeHint: "Les champs domicile sont masqués et envoyés à null pour un dépôt en boutique.",
      homeHint: "Adresse et date de visite sont obligatoires pour une intervention à domicile.",
      deviceOther: "Autre",
      deviceOtherLabel: "Précisez l'appareil",
      storeVisitLabel: "Date/heure de dépôt en boutique",
      homeVisitLabel: "Date/heure de visite",
      checkLocation: "Vérifier ma position",
      transportFeeTitle: "Frais de transport"
    },
    geofence: {
      locating: "Localisation en cours...",
      near: "Vous êtes à {distance} km de la boutique : transport gratuit.",
      far: "Vous êtes à {distance} km de la boutique : {fee} de frais de transport estimés.",
      outOfTown: "Vous semblez hors de la ville de la boutique. Vérifiez la carte ci-dessous.",
      unknown: "Position non confirmée : {fee} de frais appliqués par défaut. Vérifiez votre position pour un tarif exact.",
      denied: "Localisation refusée. {fee} de frais appliqués par défaut.",
      unsupported: "Localisation non supportée par votre navigateur. {fee} de frais appliqués par défaut.",
      error: "Impossible de déterminer votre position. {fee} de frais appliqués par défaut.",
      mapStoreLabel: "BC Store",
      mapUserLabel: "Votre position"
    },
    services: {
      title: "Services spécialisés",
      copy: "Caméra, électricité, sonorisation et maintenance technique.",
      quote: "Devis gratuit",
      benefits: ["Certifié", "Garantie 1 an", "Intervention rapide"],
      camera: "Caméra CCTV",
      electricity: "Électricité",
      sound: "Sonorisation",
      formTitle: "Demander un devis",
      portfolio: "Installations récentes"
    },
    other: {
      title: "Décrivez ce que vous souhaitez",
      upload: "Déposez une photo ici",
      submit: "Envoyer",
      sent: "Un spécialiste vous contactera sous 24h"
    },
    admin: {
      title: "Dashboard opérationnel",
      tickets: "Total Tickets",
      visits: "Visites domicile",
      revenue: "Revenu",
      lowStock: "Stock faible",
      assign: "Assigner",
      ticket: "Ticket #",
      client: "Client",
      device: "Appareil",
      type: "Type",
      status: "Statut",
      transportFee: "Frais de transport",
      estimated: "Estimé",
      searchPlaceholder: "Rechercher un ticket ou un client...",
      action: "Action",
      sidebar: ["Dashboard", "Tickets", "Products", "Users"]
    },
    support: {
      title: "Contact & support",
      map: "Carte & adresse · BC Store Douala",
      send: "Envoyer",
      call: "Appelez maintenant"
    },
    fields: {
      name: "Nom complet",
      phone: "Téléphone",
      email: "Email",
      deviceType: "Type d'appareil",
      brand: "Marque",
      model: "Modèle",
      fault: "Description de la panne",
      address: "Adresse complète",
      visitDate: "Date/heure préférée",
      message: "Décrivez ce que vous souhaitez..."
    },
    validation: {
      addressRequired: "L'adresse est obligatoire pour une visite à domicile.",
      visitDateRequired: "La date est obligatoire pour une visite à domicile."
    },
    offline: {
      message: "Vous êtes hors ligne. Affichage des données en cache."
    }
  },
  en: {
    nav: {
      home: "Home",
      shop: "Shop",
      repair: "Repair",
      services: "Services",
      other: "Other",
      admin: "Admin",
      support: "Support"
    },
    hero: {
      eyebrow: "Store + technical services",
      title: "Welcome to BC Store",
      subtitle: "Tech at your doorstep.",
      copy: "Buy accessories, phones, and computers, then book repairs or installations in the same experience.",
      buy: "Shop now",
      repair: "Repair a device"
    },
    heroSlides: {
      repair: {
        eyebrow: "Technical service",
        title: "Something wrong with your device?",
        subtitle: "Fast, reliable repairs.",
        copy: "In-store diagnosis or a home technician, whichever suits you.",
        cta: "Book a repair"
      },
      services: {
        eyebrow: "Pro installations",
        title: "Camera, electrical, sound systems",
        subtitle: "We handle it all.",
        copy: "Free quotes for your technical installations, with warranty and fast dispatch.",
        cta: "Request a quote"
      }
    },
    utilityBar: {
      contact: "Contact us",
      helpCenter: "Help center",
      tagline: "Delivering in Douala"
    },
    categoryTags: {
      CASQUE: "Popular",
      ECOUTEUR: "Compact",
      CHARGEUR: "Fast charge",
      POWERBANK: "Long battery life",
      TELEPHONE: "New",
      ORDINATEUR: "Pro"
    },
    categories: {
      CASQUE: "Headphones",
      ECOUTEUR: "Earbuds",
      CHARGEUR: "Chargers",
      POWERBANK: "Power banks",
      TELEPHONE: "Phones",
      ORDINATEUR: "Computers",
      AUTRE: "Other",
      ALL: "All"
    },
    shop: {
      title: "Shop",
      copy: "Popular products with stock, price, and persistent cart.",
      add: "Add to cart",
      view: "View product",
      stock: "In stock",
      out: "Out of stock",
      cart: "Cart",
      checkout: "Checkout",
      clear: "Clear cart",
      empty: "Your cart is empty.",
      total: "Total",
      filters: "Filters",
      category: "Category",
      price: "Price",
      brand: "Brand",
      breadcrumb: "Home > Shop",
      description: "Description",
      specifications: "Technical specifications",
      reviews: "Customer reviews",
      quantity: "Quantity",
      saleBadge: "Sale -{percent}%",
      resetFilters: "Reset filters",
      sortTopRated: "Top rated",
      sortPriceAsc: "Price: Low to High",
      sortPriceDesc: "Price: High to Low",
      searchBrands: "Search brands",
      priceMin: "Min",
      priceMax: "Max"
    },
    checkout: {
      title: "Complete checkout",
      delivery: "Delivery",
      payment: "Payment",
      confirmation: "Confirmation",
      address: "Delivery address",
      promo: "Promo code",
      apply: "Apply",
      card: "Card",
      mobileMoney: "Mobile Money",
      orangeMoney: "Orange Money",
      receiverLabel: "Payment receiver number",
      receiverHint: "Send payment to this number. The order will keep this number as its tracking reference.",
      confirm: "Confirm order",
      summary: "Summary",
      success: "Order confirmed. Send payment to {phone}; BC Store will track the transaction with this number.",
      deliveryMethod: "Delivery method",
      pickup: "Store pickup",
      pickupHint: "Pick up your order at the BC Store shop, free of charge.",
      deliverToAddress: "Deliver to address",
      deliveryFee: "Delivery fee"
    },
    repair: {
      title: "Express Diagnosis & Repair",
      copy: "Choose your device, describe the fault, then select store or home service.",
      inStore: "Store drop-off",
      atHome: "Home technician",
      submit: "Send repair request",
      sent: "Ticket created. A specialist will contact you within 24h.",
      banner: "Repair priority",
      storeHint: "Home fields are hidden and sent as null for store drop-off.",
      homeHint: "Address and visit date are required for a home intervention.",
      deviceOther: "Other",
      deviceOtherLabel: "Specify the device",
      storeVisitLabel: "Store drop-off date/time",
      homeVisitLabel: "Visit date/time",
      checkLocation: "Check my location",
      transportFeeTitle: "Transport fee"
    },
    geofence: {
      locating: "Locating...",
      near: "You're {distance} km from the store: free transport.",
      far: "You're {distance} km from the store: {fee} estimated transport fee.",
      outOfTown: "You seem to be outside the store's city. Check the map below.",
      unknown: "Location not confirmed: {fee} fee applied by default. Check your location for an exact rate.",
      denied: "Location denied. {fee} fee applied by default.",
      unsupported: "Location isn't supported by your browser. {fee} fee applied by default.",
      error: "Couldn't determine your location. {fee} fee applied by default.",
      mapStoreLabel: "BC Store",
      mapUserLabel: "Your location"
    },
    services: {
      title: "Specialized services",
      copy: "Camera, electrical, sound systems, and technical maintenance.",
      quote: "Free quote",
      benefits: ["Certified", "1-year warranty", "Fast dispatch"],
      camera: "CCTV camera",
      electricity: "Electrical",
      sound: "Sound systems",
      formTitle: "Request a quote",
      portfolio: "Recent installations"
    },
    other: {
      title: "Describe what you need",
      upload: "Drop a photo here",
      submit: "Send",
      sent: "A specialist will contact you within 24h"
    },
    admin: {
      title: "Operations dashboard",
      tickets: "Total Tickets",
      visits: "Home Visits",
      revenue: "Revenue",
      lowStock: "Low Stock",
      assign: "Assign",
      ticket: "Ticket #",
      client: "Client",
      device: "Device",
      type: "Type",
      status: "Status",
      transportFee: "Transport fee",
      estimated: "Estimated",
      searchPlaceholder: "Search ticket or client...",
      action: "Action",
      sidebar: ["Dashboard", "Tickets", "Products", "Users"]
    },
    support: {
      title: "Contact & support",
      map: "Map & address · BC Store Douala",
      send: "Send",
      call: "Call now"
    },
    fields: {
      name: "Full name",
      phone: "Phone",
      email: "Email",
      deviceType: "Device type",
      brand: "Brand",
      model: "Model",
      fault: "Fault description",
      address: "Full address",
      visitDate: "Preferred date/time",
      message: "Describe what you need..."
    },
    validation: {
      addressRequired: "Address is required for home visits.",
      visitDateRequired: "Visit date is required for home visits."
    },
    offline: {
      message: "You're offline. Showing cached data."
    }
  }
} as const;

export type Dictionary = (typeof dictionaries)[Locale];
