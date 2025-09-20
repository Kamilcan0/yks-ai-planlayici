# Database Schema Documentation

## Veritabanı Şeması (Firestore)

### Collections Overview

```
📁 users/{userId}
├── 📄 profile (document)
├── 📁 plans/{planId}
└── 📁 progress/{progressId}
```

## 1. Users Collection

### Document: `/users/{userId}/profile`

```typescript
interface UserProfile {
  kullanıcı_ID: string           // Firebase UID or guest UUID
  name: string                   // Kullanıcı adı
  email: string                  // E-posta (opsiyonel guest için)
  seviye: 'başlangıç' | 'orta' | 'ileri'  // Kullanıcı seviyesi
  haftalık_saat: number          // Haftalık çalışma saati
  hedef_tarih: string           // YYYY-MM-DD format
  field?: 'sayisal' | 'ea' | 'sozel' | 'dil'  // Alan seçimi
  tercihler?: Record<string, any>  // Kullanıcı tercihleri
  createdAt: Timestamp          // Oluşturulma tarihi
  updatedAt: Timestamp          // Güncellenme tarihi
}
```

**Örnek:**
```json
{
  "kullanıcı_ID": "user_1234567890",
  "name": "Ahmet Yılmaz",
  "email": "ahmet@email.com",
  "seviye": "orta",
  "haftalık_saat": 25,
  "hedef_tarih": "2024-06-15",
  "field": "sayisal",
  "tercihler": {
    "difficulty_preference": "challenging",
    "study_time_preference": "morning"
  },
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-20T15:30:00Z"
}
```

## 2. Plans Collection

### Document: `/users/{userId}/plans/{planId}`

```typescript
interface StudyPlan {
  kullanıcı_ID: string           // User ID reference
  plan_id: string               // Unique plan identifier
  tarih: string                 // Plan oluşturma tarihi (YYYY-MM-DD)
  haftalık_plan: DayPlan[]      // 7 günlük plan array
  kaynak_önerileri: ResourceRecommendation[]  // Önerilen kaynaklar
  ux_önerileri?: string[]       // Kullanım ipuçları
  adaptasyon_notları?: string   // AI'nın plan notları
  confidence_overall?: number   // Genel güven skoru (0-1)
  createdAt: Timestamp
  updatedAt: Timestamp
}

interface DayPlan {
  gün: string                   // "Pazartesi", "Salı", etc.
  TYT: StudyBlock[]            // TYT blokları
  AYT: StudyBlock[]            // AYT blokları
}

interface StudyBlock {
  konu: string                  // Ders adı
  soru_sayısı: number          // Çözülecek soru sayısı
  süre_dakika: number          // Tahmini süre (dakika)
  odak_konular: string[]       // Alt konular
  confidence: number           // AI güven skoru (0-1)
  not?: string                 // Ek notlar
  blok_id?: string            // Progress tracking için
}

interface ResourceRecommendation {
  konu: string                              // İlgili ders
  tip: 'kitap' | 'video' | 'soru_bankası' | 'online_kaynak'
  isim: string                             // Kaynak adı
  zorluk: 'kolay' | 'orta' | 'zor'        // Zorluk seviyesi
  beklenen_süre_dakika: number            // Tahmini süre
  öncelik: number                         // 1-5 arası öncelik
  link?: string                           // Web linki (opsiyonel)
  repeat_after_days?: number              // Tekrar aralığı
}
```

**Örnek:**
```json
{
  "kullanıcı_ID": "user_1234567890",
  "plan_id": "plan_2024_01_15",
  "tarih": "2024-01-15",
  "haftalık_plan": [
    {
      "gün": "Pazartesi",
      "TYT": [
        {
          "konu": "Matematik",
          "soru_sayısı": 25,
          "süre_dakika": 90,
          "odak_konular": ["Fonksiyonlar", "Denklem sistemleri"],
          "confidence": 0.85,
          "not": "Temel kavramları pekiştir",
          "blok_id": "pazartesi_tyt_math_1"
        }
      ],
      "AYT": [
        {
          "konu": "Matematik",
          "soru_sayısı": 15,
          "süre_dakika": 75,
          "odak_konular": ["Türev", "İntegral"],
          "confidence": 0.72,
          "not": "Formülleri ezberle",
          "blok_id": "pazartesi_ayt_math_1"
        }
      ]
    }
  ],
  "kaynak_önerileri": [
    {
      "konu": "Matematik",
      "tip": "soru_bankası",
      "isim": "TYT Matematik Soru Bankası",
      "zorluk": "orta",
      "beklenen_süre_dakika": 120,
      "öncelik": 5,
      "repeat_after_days": 3
    }
  ],
  "ux_önerileri": [
    "Planınızı takip etmek için günlük kontrol listesi kullanın",
    "Zorlandığınız konulara ekstra zaman ayırın"
  ],
  "adaptasyon_notları": "Orta seviye için optimize edilmiş 25 saatlik haftalık program",
  "confidence_overall": 0.78,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

## 3. Progress Collection

### Document: `/users/{userId}/progress/{progressId}`

```typescript
interface UserProgress {
  user_id: string               // User ID reference
  progress_id: string           // Unique progress entry ID
  blok_id: string              // StudyBlock reference
  plan_id: string              // Plan reference
  tamamlandı: boolean          // Completion status
  zaman: string                // Completion time (ISO string)
  performance_score?: number    // Opsiyonel performans skoru
  notes?: string               // Kullanıcı notları
  createdAt: Timestamp
}
```

**Örnek:**
```json
{
  "user_id": "user_1234567890",
  "progress_id": "progress_1642234567890",
  "blok_id": "pazartesi_tyt_math_1",
  "plan_id": "plan_2024_01_15",
  "tamamlandı": true,
  "zaman": "2024-01-15T14:30:00Z",
  "performance_score": 0.85,
  "notes": "Fonksiyonlar konusunda zorlandım",
  "createdAt": "2024-01-15T14:35:00Z"
}
```

## 4. Analytics Collection (Opsiyonel)

### Document: `/analytics/events/{eventId}`

```typescript
interface AnalyticsEvent {
  event_id: string
  user_id: string
  event_type: string           // 'plan_generation', 'progress_update', etc.
  timestamp: Timestamp
  data: Record<string, any>    // Event-specific data
  session_id?: string
}
```

## Database Operations

### 1. User Management

```typescript
// Create user profile
async function createUserProfile(userId: string, profileData: Partial<UserProfile>) {
  const userRef = doc(db, 'users', userId, 'profile')
  await setDoc(userRef, {
    ...profileData,
    kullanıcı_ID: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

// Get user profile
async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', userId, 'profile')
  const snapshot = await getDoc(userRef)
  return snapshot.exists() ? snapshot.data() as UserProfile : null
}

// Update user profile
async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const userRef = doc(db, 'users', userId, 'profile')
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}
```

### 2. Plan Management

```typescript
// Save generated plan
async function savePlan(plan: StudyPlan) {
  const planRef = doc(db, 'users', plan.kullanıcı_ID, 'plans', plan.plan_id)
  await setDoc(planRef, {
    ...plan,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

// Get user's latest plan
async function getLatestPlan(userId: string): Promise<StudyPlan | null> {
  const plansRef = collection(db, 'users', userId, 'plans')
  const q = query(plansRef, orderBy('createdAt', 'desc'), limit(1))
  const snapshot = await getDocs(q)
  
  if (snapshot.empty) return null
  return snapshot.docs[0].data() as StudyPlan
}

// Get specific plan
async function getPlan(userId: string, planId: string): Promise<StudyPlan | null> {
  const planRef = doc(db, 'users', userId, 'plans', planId)
  const snapshot = await getDoc(planRef)
  return snapshot.exists() ? snapshot.data() as StudyPlan : null
}
```

### 3. Progress Tracking

```typescript
// Save progress
async function saveProgress(progress: UserProgress) {
  const progressRef = doc(db, 'users', progress.user_id, 'progress', progress.progress_id)
  await setDoc(progressRef, {
    ...progress,
    createdAt: serverTimestamp()
  })
}

// Get user progress for a plan
async function getUserProgress(userId: string, planId?: string): Promise<UserProgress[]> {
  const progressRef = collection(db, 'users', userId, 'progress')
  let q = query(progressRef, orderBy('createdAt', 'desc'))
  
  if (planId) {
    q = query(progressRef, where('plan_id', '==', planId), orderBy('createdAt', 'desc'))
  }
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => doc.data() as UserProgress)
}

// Get completion stats
async function getCompletionStats(userId: string, planId: string) {
  const progressRef = collection(db, 'users', userId, 'progress')
  const q = query(progressRef, where('plan_id', '==', planId))
  const snapshot = await getDocs(q)
  
  const total = snapshot.size
  const completed = snapshot.docs.filter(doc => doc.data().tamamlandı).length
  
  return {
    total,
    completed,
    completion_rate: total > 0 ? completed / total : 0
  }
}
```

## Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Nested collections inherit parent permissions
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Public analytics (read-only)
    match /analytics/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Indexing Strategy

### Composite Indexes

```javascript
// Progress queries by plan and date
{
  collectionGroup: "progress",
  fields: [
    { fieldPath: "plan_id", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// Plans by user and date
{
  collectionGroup: "plans",
  fields: [
    { fieldPath: "kullanıcı_ID", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}
```

## Backup Strategy

### 1. Automated Backups
- Firebase project settings → Backup
- Daily backups enabled
- 30-day retention policy

### 2. Export Strategy
```bash
# Export entire database
gcloud firestore export gs://backup-bucket/$(date +%Y%m%d)

# Export specific collections
gcloud firestore export gs://backup-bucket/users-$(date +%Y%m%d) \
  --collection-ids=users
```

### 3. Data Migration
```typescript
// Migration script example
async function migrateUserProfiles() {
  const usersRef = collection(db, 'users')
  const snapshot = await getDocs(usersRef)
  
  const batch = writeBatch(db)
  
  snapshot.docs.forEach(doc => {
    const profileRef = doc(db, 'users', doc.id, 'profile')
    batch.set(profileRef, {
      ...doc.data(),
      version: '2.0',
      migratedAt: serverTimestamp()
    })
  })
  
  await batch.commit()
}
```

## Performance Considerations

### 1. Query Optimization
- Use composite indexes for complex queries
- Limit query results with `limit()`
- Use pagination for large datasets

### 2. Data Structure
- Denormalize frequently accessed data
- Use subcollections for 1-to-many relationships
- Keep document sizes under 1MB

### 3. Caching Strategy
- Cache user profiles in memory
- Use local storage for guest users
- Implement offline support with Firestore offline persistence

## Guest User Handling

### LocalStorage Schema

```typescript
// localStorage keys for guest users
interface GuestUserData {
  guest_user_id: string           // "guest_" + timestamp + random
  guest_user_profile: UserProfile // JSON string
  guest_user_plans: StudyPlan[]   // JSON string array
  guest_user_progress: UserProgress[] // JSON string array
}
```

### Guest Migration
```typescript
// Convert guest to registered user
async function migrateGuestToRegistered(guestData: GuestUserData, newUserId: string) {
  // Copy profile
  await createUserProfile(newUserId, guestData.guest_user_profile)
  
  // Copy plans
  for (const plan of guestData.guest_user_plans) {
    plan.kullanıcı_ID = newUserId
    await savePlan(plan)
  }
  
  // Copy progress
  for (const progress of guestData.guest_user_progress) {
    progress.user_id = newUserId
    await saveProgress(progress)
  }
  
  // Clear guest data
  localStorage.removeItem('guest_user_id')
  localStorage.removeItem('guest_user_profile')
  localStorage.removeItem('guest_user_plans')
  localStorage.removeItem('guest_user_progress')
}
```

