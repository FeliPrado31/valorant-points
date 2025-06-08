# Task 1: Translation Content Extraction and Creation

## Overview
This task focuses on systematically extracting all hardcoded English text from the application and creating comprehensive translation files for both English and Spanish. This task works independently on translation JSON files only.

## Duration: 6 hours
## Dependencies: Foundation Setup Task (must be completed first)
## Conflicts: None (only modifies translation JSON files)

## Git Workflow
**MANDATORY**: Follow this exact branching strategy:

1. **Create task branch**:
   ```bash
   git checkout 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   git pull origin 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   git checkout -b task-1-translation-content-extraction
   ```

2. **Work on task** following the implementation steps below

3. **Commit and push**:
   ```bash
   git add src/locales/
   git commit -m "feat: create comprehensive translation files for EN/ES"
   git push origin task-1-translation-content-extraction
   ```

4. **Create Pull Request**:
   - **Target**: `29-implement-internationalization-i18n-support-for-english-and-spanish-languages`
   - **Title**: `Task 1: Translation Content Extraction`
   - **Description**: Include validation checklist from this task

## Objectives
- Extract all hardcoded English text from existing components
- Create comprehensive English translation files
- Provide accurate Spanish translations
- Organize translations by logical namespaces
- Establish consistent translation key naming patterns

## Files Modified (No Conflicts)
**Only Translation Files**:
- `src/locales/en/common.json`
- `src/locales/en/navigation.json`
- `src/locales/en/dashboard.json`
- `src/locales/en/profile.json`
- `src/locales/en/setup.json`
- `src/locales/en/subscription.json`
- `src/locales/en/missions.json`
- `src/locales/en/errors.json`
- `src/locales/es/common.json`
- `src/locales/es/navigation.json`
- `src/locales/es/dashboard.json`
- `src/locales/es/profile.json`
- `src/locales/es/setup.json`
- `src/locales/es/subscription.json`
- `src/locales/es/missions.json`
- `src/locales/es/errors.json`

## Content Extraction Strategy

### 1. Common Translations (1 hour)
**Source Analysis**: Extract from all components for common UI elements

**File**: `src/locales/en/common.json`
```json
{
  "buttons": {
    "save": "Save",
    "cancel": "Cancel",
    "submit": "Submit",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "continue": "Continue",
    "refresh": "Refresh",
    "upgrade": "Upgrade",
    "getStarted": "Get Started",
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "loading": "Loading...",
    "retry": "Retry",
    "accept": "Accept",
    "decline": "Decline",
    "confirm": "Confirm",
    "edit": "Edit",
    "delete": "Delete",
    "view": "View",
    "download": "Download"
  },
  "labels": {
    "username": "Username",
    "email": "Email",
    "password": "Password",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort",
    "date": "Date",
    "status": "Status",
    "progress": "Progress",
    "name": "Name",
    "description": "Description",
    "type": "Type",
    "category": "Category"
  },
  "status": {
    "active": "Active",
    "inactive": "Inactive",
    "completed": "Completed",
    "pending": "Pending",
    "failed": "Failed",
    "success": "Success",
    "error": "Error",
    "warning": "Warning",
    "info": "Info"
  },
  "time": {
    "hours": "hours",
    "minutes": "minutes",
    "seconds": "seconds",
    "days": "days",
    "weeks": "weeks",
    "months": "months",
    "years": "years",
    "ago": "ago",
    "now": "now",
    "today": "today",
    "yesterday": "yesterday",
    "tomorrow": "tomorrow"
  },
  "numbers": {
    "first": "first",
    "second": "second",
    "third": "third",
    "last": "last",
    "total": "total",
    "count": "count"
  }
}
```

**File**: `src/locales/es/common.json`
```json
{
  "buttons": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "submit": "Enviar",
    "close": "Cerrar",
    "back": "Atrás",
    "next": "Siguiente",
    "continue": "Continuar",
    "refresh": "Actualizar",
    "upgrade": "Mejorar",
    "getStarted": "Comenzar",
    "signIn": "Iniciar Sesión",
    "signUp": "Registrarse",
    "loading": "Cargando...",
    "retry": "Reintentar",
    "accept": "Aceptar",
    "decline": "Rechazar",
    "confirm": "Confirmar",
    "edit": "Editar",
    "delete": "Eliminar",
    "view": "Ver",
    "download": "Descargar"
  },
  "labels": {
    "username": "Nombre de usuario",
    "email": "Correo electrónico",
    "password": "Contraseña",
    "search": "Buscar",
    "filter": "Filtrar",
    "sort": "Ordenar",
    "date": "Fecha",
    "status": "Estado",
    "progress": "Progreso",
    "name": "Nombre",
    "description": "Descripción",
    "type": "Tipo",
    "category": "Categoría"
  },
  "status": {
    "active": "Activo",
    "inactive": "Inactivo",
    "completed": "Completado",
    "pending": "Pendiente",
    "failed": "Fallido",
    "success": "Éxito",
    "error": "Error",
    "warning": "Advertencia",
    "info": "Información"
  },
  "time": {
    "hours": "horas",
    "minutes": "minutos",
    "seconds": "segundos",
    "days": "días",
    "weeks": "semanas",
    "months": "meses",
    "years": "años",
    "ago": "hace",
    "now": "ahora",
    "today": "hoy",
    "yesterday": "ayer",
    "tomorrow": "mañana"
  },
  "numbers": {
    "first": "primero",
    "second": "segundo",
    "third": "tercero",
    "last": "último",
    "total": "total",
    "count": "cantidad"
  }
}
```

### 2. Navigation Translations (30 minutes)
**Source**: `src/components/Navigation.tsx`

**File**: `src/locales/en/navigation.json`
```json
{
  "brand": {
    "name": "Valorant Missions",
    "shortName": "VM"
  },
  "items": {
    "dashboard": {
      "label": "Dashboard",
      "description": "View your missions and progress"
    },
    "profile": {
      "label": "Profile",
      "description": "Manage your account settings"
    },
    "subscription": {
      "label": "Subscription",
      "description": "Manage your subscription plan"
    }
  },
  "actions": {
    "refresh": "Refresh",
    "refreshProgress": "Refresh Progress",
    "updateMissionProgress": "Update mission progress",
    "toggleMenu": "Toggle navigation menu"
  },
  "welcome": "Welcome, {name}!",
  "mobileMenu": {
    "open": "Open menu",
    "close": "Close menu"
  }
}
```

**File**: `src/locales/es/navigation.json`
```json
{
  "brand": {
    "name": "Valorant Missions",
    "shortName": "VM"
  },
  "items": {
    "dashboard": {
      "label": "Panel",
      "description": "Ve tus misiones y progreso"
    },
    "profile": {
      "label": "Perfil",
      "description": "Gestiona la configuración de tu cuenta"
    },
    "subscription": {
      "label": "Suscripción",
      "description": "Gestiona tu plan de suscripción"
    }
  },
  "actions": {
    "refresh": "Actualizar",
    "refreshProgress": "Actualizar Progreso",
    "updateMissionProgress": "Actualizar progreso de misiones",
    "toggleMenu": "Alternar menú de navegación"
  },
  "welcome": "¡Bienvenido, {name}!",
  "mobileMenu": {
    "open": "Abrir menú",
    "close": "Cerrar menú"
  }
}
```

### 3. Dashboard Translations (1.5 hours)
**Source**: `src/app/dashboard/page.tsx`

**File**: `src/locales/en/dashboard.json`
```json
{
  "loading": "Loading...",
  "loadingDashboard": "Loading dashboard...",
  "welcome": {
    "title": "Welcome back, {username}!",
    "connectedRiotId": "Connected Riot ID: {riotId}",
    "readyMessage": "Ready to complete missions!"
  },
  "stats": {
    "activeMissions": "Active Missions",
    "completedMissions": "Completed Missions",
    "totalPoints": "Total Points",
    "recentMatches": "Recent Matches"
  },
  "missions": {
    "available": "Available Missions",
    "noActiveMissions": "No active missions",
    "acceptMission": "Accept Mission",
    "target": "Target: {target} {type}",
    "reward": "Reward: {points} points",
    "progress": "Progress: {current}/{target}",
    "accepted": "Accepted: {date}",
    "progressNote": "Only matches played after acceptance count toward progress",
    "difficulty": {
      "easy": "Easy",
      "medium": "Medium",
      "hard": "Hard"
    }
  },
  "matches": {
    "noMatches": "No recent matches found",
    "loadingMatches": "Loading recent matches...",
    "matchDate": "Match Date",
    "gameMode": "Game Mode",
    "result": "Result"
  },
  "errors": {
    "loadingFailed": "Failed to load dashboard data",
    "missionAcceptFailed": "Failed to accept mission",
    "refreshFailed": "Failed to refresh progress"
  }
}
```

**File**: `src/locales/es/dashboard.json`
```json
{
  "loading": "Cargando...",
  "loadingDashboard": "Cargando panel...",
  "welcome": {
    "title": "¡Bienvenido de vuelta, {username}!",
    "connectedRiotId": "Riot ID conectado: {riotId}",
    "readyMessage": "¡Listo para completar misiones!"
  },
  "stats": {
    "activeMissions": "Misiones Activas",
    "completedMissions": "Misiones Completadas",
    "totalPoints": "Puntos Totales",
    "recentMatches": "Partidas Recientes"
  },
  "missions": {
    "available": "Misiones Disponibles",
    "noActiveMissions": "No hay misiones activas",
    "acceptMission": "Aceptar Misión",
    "target": "Objetivo: {target} {type}",
    "reward": "Recompensa: {points} puntos",
    "progress": "Progreso: {current}/{target}",
    "accepted": "Aceptada: {date}",
    "progressNote": "Solo las partidas jugadas después de la aceptación cuentan para el progreso",
    "difficulty": {
      "easy": "Fácil",
      "medium": "Medio",
      "hard": "Difícil"
    }
  },
  "matches": {
    "noMatches": "No se encontraron partidas recientes",
    "loadingMatches": "Cargando partidas recientes...",
    "matchDate": "Fecha de Partida",
    "gameMode": "Modo de Juego",
    "result": "Resultado"
  },
  "errors": {
    "loadingFailed": "Error al cargar datos del panel",
    "missionAcceptFailed": "Error al aceptar misión",
    "refreshFailed": "Error al actualizar progreso"
  }
}
```

### 4. Profile Translations (45 minutes)
**Source**: `src/app/profile/page.tsx`

**File**: `src/locales/en/profile.json`
```json
{
  "title": "Profile Settings",
  "description": "Configure your profile and connect your Valorant account to start tracking missions.",
  "sections": {
    "basicInfo": "Basic Information",
    "valorantAccount": "Valorant Account",
    "verification": "Account Verification"
  },
  "fields": {
    "username": "Username",
    "valorantName": "Valorant Name",
    "valorantTag": "Valorant Tag",
    "riotId": "Riot ID",
    "email": "Email Address"
  },
  "placeholders": {
    "username": "Enter your username",
    "valorantName": "Enter your Valorant name",
    "valorantTag": "Enter your tag (e.g., 1234)"
  },
  "actions": {
    "verify": "Verify Player",
    "saveProfile": "Save Profile",
    "linkAccount": "Link Account",
    "verifying": "Verifying...",
    "saving": "Saving..."
  },
  "messages": {
    "verificationSuccess": "Player verified successfully!",
    "profileSaved": "Profile saved successfully!",
    "accountLinked": "Riot ID linked successfully!",
    "verificationFailed": "Player verification failed",
    "saveFailed": "Failed to save profile"
  },
  "validation": {
    "usernameRequired": "Username is required",
    "valorantNameRequired": "Valorant name is required",
    "valorantTagRequired": "Valorant tag is required",
    "invalidTag": "Tag must be 3-5 digits"
  }
}
```

**File**: `src/locales/es/profile.json`
```json
{
  "title": "Configuración del Perfil",
  "description": "Configura tu perfil y conecta tu cuenta de Valorant para comenzar a rastrear misiones.",
  "sections": {
    "basicInfo": "Información Básica",
    "valorantAccount": "Cuenta de Valorant",
    "verification": "Verificación de Cuenta"
  },
  "fields": {
    "username": "Nombre de Usuario",
    "valorantName": "Nombre de Valorant",
    "valorantTag": "Etiqueta de Valorant",
    "riotId": "Riot ID",
    "email": "Dirección de Correo"
  },
  "placeholders": {
    "username": "Ingresa tu nombre de usuario",
    "valorantName": "Ingresa tu nombre de Valorant",
    "valorantTag": "Ingresa tu etiqueta (ej. 1234)"
  },
  "actions": {
    "verify": "Verificar Jugador",
    "saveProfile": "Guardar Perfil",
    "linkAccount": "Vincular Cuenta",
    "verifying": "Verificando...",
    "saving": "Guardando..."
  },
  "messages": {
    "verificationSuccess": "¡Jugador verificado exitosamente!",
    "profileSaved": "¡Perfil guardado exitosamente!",
    "accountLinked": "¡Riot ID vinculado exitosamente!",
    "verificationFailed": "Error en la verificación del jugador",
    "saveFailed": "Error al guardar el perfil"
  },
  "validation": {
    "usernameRequired": "El nombre de usuario es requerido",
    "valorantNameRequired": "El nombre de Valorant es requerido",
    "valorantTagRequired": "La etiqueta de Valorant es requerida",
    "invalidTag": "La etiqueta debe tener 3-5 dígitos"
  }
}
```

### 5. Setup Translations (45 minutes)
**Source**: `src/app/setup/page.tsx`

**File**: `src/locales/en/setup.json`
```json
{
  "title": "Welcome to Valorant Missions!",
  "description": "To start tracking your missions and progress, we need to connect your Valorant account.",
  "steps": {
    "verification": "Player Verification",
    "completion": "Complete Setup"
  },
  "instructions": {
    "enterRiotId": "Enter your Riot ID to verify your Valorant account",
    "format": "Format: Username#TAG (e.g., Player#1234)",
    "note": "Your Riot ID will be used to track your Valorant matches and update mission progress automatically."
  },
  "fields": {
    "username": "Username",
    "valorantName": "Valorant Name",
    "valorantTag": "Valorant Tag"
  },
  "actions": {
    "completeSetup": "Complete Setup & Start Missions",
    "verifyPlayer": "Verify Player",
    "setupInProgress": "Setting up...",
    "verifying": "Verifying..."
  },
  "messages": {
    "setupComplete": "Setup completed successfully!",
    "redirecting": "Redirecting to dashboard...",
    "verificationSuccess": "Player verified successfully!",
    "setupFailed": "Setup failed. Please try again.",
    "verificationFailed": "Player verification failed. Please check your Riot ID."
  },
  "playerInfo": {
    "accountLevel": "Account Level: {level}",
    "region": "Region: {region}",
    "lastUpdate": "Last Update: {date}"
  }
}
```

**File**: `src/locales/es/setup.json`
```json
{
  "title": "¡Bienvenido a Valorant Missions!",
  "description": "Para comenzar a rastrear tus misiones y progreso, necesitamos conectar tu cuenta de Valorant.",
  "steps": {
    "verification": "Verificación de Jugador",
    "completion": "Completar Configuración"
  },
  "instructions": {
    "enterRiotId": "Ingresa tu Riot ID para verificar tu cuenta de Valorant",
    "format": "Formato: NombreUsuario#ETIQUETA (ej. Jugador#1234)",
    "note": "Tu Riot ID será usado para rastrear tus partidas de Valorant y actualizar el progreso de misiones automáticamente."
  },
  "fields": {
    "username": "Nombre de Usuario",
    "valorantName": "Nombre de Valorant",
    "valorantTag": "Etiqueta de Valorant"
  },
  "actions": {
    "completeSetup": "Completar Configuración e Iniciar Misiones",
    "verifyPlayer": "Verificar Jugador",
    "setupInProgress": "Configurando...",
    "verifying": "Verificando..."
  },
  "messages": {
    "setupComplete": "¡Configuración completada exitosamente!",
    "redirecting": "Redirigiendo al panel...",
    "verificationSuccess": "¡Jugador verificado exitosamente!",
    "setupFailed": "Error en la configuración. Por favor intenta de nuevo.",
    "verificationFailed": "Error en la verificación del jugador. Por favor verifica tu Riot ID."
  },
  "playerInfo": {
    "accountLevel": "Nivel de Cuenta: {level}",
    "region": "Región: {region}",
    "lastUpdate": "Última Actualización: {date}"
  }
}
```

## Validation Checklist
- [ ] All JSON files are valid JSON format
- [ ] Translation keys are consistent between English and Spanish
- [ ] Variable placeholders match between languages
- [ ] Spanish translations are culturally appropriate
- [ ] Technical gaming terms are properly translated
- [ ] No missing translations between language pairs

### 6. Subscription Translations (45 minutes)
**Source**: `src/app/subscription/page.tsx`, `src/components/PricingModal.tsx`, `src/components/SubscriptionStatus.tsx`

**File**: `src/locales/en/subscription.json`
```json
{
  "title": "Subscription Management",
  "description": "Manage your subscription and unlock more missions",
  "plans": {
    "free": {
      "name": "Free",
      "description": "Basic mission tracking",
      "features": [
        "Up to 3 active missions",
        "Basic progress tracking",
        "Community support"
      ]
    },
    "standard": {
      "name": "Standard",
      "description": "Enhanced mission experience",
      "features": [
        "Up to 7 active missions",
        "Advanced statistics",
        "Priority support",
        "Mission filters"
      ]
    },
    "premium": {
      "name": "Premium",
      "description": "Ultimate mission experience",
      "features": [
        "Unlimited active missions",
        "Advanced analytics",
        "Premium support",
        "Early access features"
      ]
    }
  },
  "status": {
    "currentPlan": "Current Plan",
    "dailySlotsUsed": "Daily Slots Used",
    "dailyLimitReached": "Daily limit reached. Resets in {hours} hours",
    "upgradeAvailable": "Upgrade available"
  },
  "actions": {
    "upgrade": "Upgrade Plan",
    "manageBilling": "Manage Billing",
    "cancelSubscription": "Cancel Subscription",
    "selectPlan": "Select Plan",
    "currentPlan": "Current Plan"
  },
  "billing": {
    "monthly": "/month",
    "free": "Free",
    "price": "${price}",
    "popular": "Most Popular"
  }
}
```

**File**: `src/locales/es/subscription.json`
```json
{
  "title": "Gestión de Suscripción",
  "description": "Gestiona tu suscripción y desbloquea más misiones",
  "plans": {
    "free": {
      "name": "Gratis",
      "description": "Seguimiento básico de misiones",
      "features": [
        "Hasta 3 misiones activas",
        "Seguimiento básico de progreso",
        "Soporte de la comunidad"
      ]
    },
    "standard": {
      "name": "Estándar",
      "description": "Experiencia mejorada de misiones",
      "features": [
        "Hasta 7 misiones activas",
        "Estadísticas avanzadas",
        "Soporte prioritario",
        "Filtros de misiones"
      ]
    },
    "premium": {
      "name": "Premium",
      "description": "Experiencia definitiva de misiones",
      "features": [
        "Misiones activas ilimitadas",
        "Análisis avanzados",
        "Soporte premium",
        "Acceso anticipado a funciones"
      ]
    }
  },
  "status": {
    "currentPlan": "Plan Actual",
    "dailySlotsUsed": "Espacios Diarios Usados",
    "dailyLimitReached": "Límite diario alcanzado. Se reinicia en {hours} horas",
    "upgradeAvailable": "Mejora disponible"
  },
  "actions": {
    "upgrade": "Mejorar Plan",
    "manageBilling": "Gestionar Facturación",
    "cancelSubscription": "Cancelar Suscripción",
    "selectPlan": "Seleccionar Plan",
    "currentPlan": "Plan Actual"
  },
  "billing": {
    "monthly": "/mes",
    "free": "Gratis",
    "price": "${price}",
    "popular": "Más Popular"
  }
}
```

### 7. Missions Translations (45 minutes)
**Source**: `src/components/MissionFilters.tsx`, mission-related content

**File**: `src/locales/en/missions.json`
```json
{
  "types": {
    "kills": "kills",
    "headshots": "headshots",
    "gamemode": "gamemode",
    "weapon": "weapon",
    "rounds": "rounds",
    "wins": "wins"
  },
  "difficulty": {
    "easy": "Easy",
    "medium": "Medium",
    "hard": "Hard"
  },
  "filters": {
    "searchPlaceholder": "Search missions...",
    "filterBy": "Filter by",
    "difficulty": "Difficulty",
    "type": "Type",
    "clearFilters": "Clear Filters",
    "showingResults": "Showing {count} of {total} missions",
    "noResults": "No missions found matching your criteria"
  },
  "actions": {
    "acceptMission": "Accept Mission",
    "viewProgress": "View Progress",
    "completeMission": "Complete Mission"
  },
  "status": {
    "available": "Available",
    "active": "Active",
    "completed": "Completed",
    "expired": "Expired"
  }
}
```

**File**: `src/locales/es/missions.json`
```json
{
  "types": {
    "kills": "eliminaciones",
    "headshots": "disparos a la cabeza",
    "gamemode": "modo de juego",
    "weapon": "arma",
    "rounds": "rondas",
    "wins": "victorias"
  },
  "difficulty": {
    "easy": "Fácil",
    "medium": "Medio",
    "hard": "Difícil"
  },
  "filters": {
    "searchPlaceholder": "Buscar misiones...",
    "filterBy": "Filtrar por",
    "difficulty": "Dificultad",
    "type": "Tipo",
    "clearFilters": "Limpiar Filtros",
    "showingResults": "Mostrando {count} de {total} misiones",
    "noResults": "No se encontraron misiones que coincidan con tus criterios"
  },
  "actions": {
    "acceptMission": "Aceptar Misión",
    "viewProgress": "Ver Progreso",
    "completeMission": "Completar Misión"
  },
  "status": {
    "available": "Disponible",
    "active": "Activa",
    "completed": "Completada",
    "expired": "Expirada"
  }
}
```

### 8. Error Translations (30 minutes)
**Source**: Error handling throughout the application

**File**: `src/locales/en/errors.json`
```json
{
  "api": {
    "networkError": "Network error. Please check your connection.",
    "serverError": "Server error. Please try again later.",
    "unauthorized": "Unauthorized access. Please sign in.",
    "forbidden": "Access denied.",
    "notFound": "Resource not found.",
    "timeout": "Request timeout. Please try again.",
    "rateLimited": "Too many requests. Please wait and try again."
  },
  "validation": {
    "required": "This field is required",
    "invalidEmail": "Please enter a valid email address",
    "invalidRiotId": "Please enter a valid Riot ID (Username#TAG)",
    "minLength": "Must be at least {min} characters",
    "maxLength": "Must be no more than {max} characters",
    "invalidFormat": "Invalid format"
  },
  "missions": {
    "acceptFailed": "Failed to accept mission. Please try again.",
    "progressUpdateFailed": "Failed to update progress. Please try again.",
    "noMissionsAvailable": "No missions available at this time.",
    "missionNotFound": "Mission not found.",
    "alreadyAccepted": "Mission already accepted."
  },
  "profile": {
    "saveFailed": "Failed to save profile changes.",
    "verificationFailed": "Player verification failed.",
    "linkFailed": "Failed to link Riot account."
  },
  "subscription": {
    "upgradeFailed": "Failed to upgrade subscription.",
    "cancelFailed": "Failed to cancel subscription.",
    "paymentFailed": "Payment processing failed."
  },
  "general": {
    "unexpectedError": "An unexpected error occurred.",
    "tryAgain": "Please try again.",
    "contactSupport": "If the problem persists, please contact support."
  }
}
```

**File**: `src/locales/es/errors.json`
```json
{
  "api": {
    "networkError": "Error de red. Por favor verifica tu conexión.",
    "serverError": "Error del servidor. Por favor intenta más tarde.",
    "unauthorized": "Acceso no autorizado. Por favor inicia sesión.",
    "forbidden": "Acceso denegado.",
    "notFound": "Recurso no encontrado.",
    "timeout": "Tiempo de espera agotado. Por favor intenta de nuevo.",
    "rateLimited": "Demasiadas solicitudes. Por favor espera e intenta de nuevo."
  },
  "validation": {
    "required": "Este campo es requerido",
    "invalidEmail": "Por favor ingresa una dirección de correo válida",
    "invalidRiotId": "Por favor ingresa un Riot ID válido (NombreUsuario#ETIQUETA)",
    "minLength": "Debe tener al menos {min} caracteres",
    "maxLength": "No debe tener más de {max} caracteres",
    "invalidFormat": "Formato inválido"
  },
  "missions": {
    "acceptFailed": "Error al aceptar misión. Por favor intenta de nuevo.",
    "progressUpdateFailed": "Error al actualizar progreso. Por favor intenta de nuevo.",
    "noMissionsAvailable": "No hay misiones disponibles en este momento.",
    "missionNotFound": "Misión no encontrada.",
    "alreadyAccepted": "Misión ya aceptada."
  },
  "profile": {
    "saveFailed": "Error al guardar cambios del perfil.",
    "verificationFailed": "Error en la verificación del jugador.",
    "linkFailed": "Error al vincular cuenta de Riot."
  },
  "subscription": {
    "upgradeFailed": "Error al mejorar suscripción.",
    "cancelFailed": "Error al cancelar suscripción.",
    "paymentFailed": "Error en el procesamiento del pago."
  },
  "general": {
    "unexpectedError": "Ocurrió un error inesperado.",
    "tryAgain": "Por favor intenta de nuevo.",
    "contactSupport": "Si el problema persiste, por favor contacta soporte."
  }
}
```

## Quality Assurance Notes
- Gaming terms like "Valorant", "Riot ID" remain unchanged
- Spanish uses formal address (usted) for professional tone
- Regional Spanish variations avoided for broader compatibility
- Technical UI terms maintain consistency across the application

## Next Steps
This task provides the foundation translation content that other parallel tasks will reference when updating components. The translation files are now ready for integration into the React components.
