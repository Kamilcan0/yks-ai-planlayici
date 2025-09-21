# 🤝 YKS Plan'a Katkıda Bulunma Rehberi

YKS Plan projesine katkıda bulunmak istediğiniz için teşekkürler! Bu rehber, nasıl katkıda bulunabileceğinizi açıklar.

## 📋 İçindekiler

- [Başlamadan Önce](#başlamadan-önce)
- [Geliştirme Ortamı Kurulumu](#geliştirme-ortamı-kurulumu)
- [Katkıda Bulunma Süreci](#katkıda-bulunma-süreci)
- [Kod Standartları](#kod-standartları)
- [Test Yazma](#test-yazma)
- [Pull Request Süreci](#pull-request-süreci)
- [Issue Raporlama](#issue-raporlama)

## 🚀 Başlamadan Önce

### Hangi Konularda Yardıma İhtiyacımız Var?

- 🐛 **Bug Fixes** - Hata düzeltmeleri
- ✨ **Yeni Özellikler** - Kullanıcı deneyimini iyileştiren özellikler
- 📝 **Dokümantasyon** - README, kod dokümantasyonu
- 🎨 **UI/UX İyileştirmeleri** - Tasarım ve kullanılabilirlik
- 🧪 **Test Coverage** - Unit ve integration testler
- 🌐 **Lokalizasyon** - Çoklu dil desteği
- ⚡ **Performans** - Optimizasyon ve hız iyileştirmeleri

### Davranış Kuralları

- Saygılı ve yapıcı iletişim kurun
- Kapsayıcı bir ortam yaratmaya yardım edin
- Farklı görüşlere açık olun
- Öğrenmeye ve öğretmeye odaklanın

## 🛠️ Geliştirme Ortamı Kurulumu

### Gereksinimler

- **Node.js** 18+
- **npm** veya **yarn**
- **Git**
- **VS Code** (önerilen)

### Kurulum Adımları

```bash
# 1. Repository'yi fork edin ve clone yapın
git clone https://github.com/YOUR_USERNAME/yks-plan.git
cd yks-plan

# 2. Dependencies yükleyin
cd web
npm install

# 3. Environment variables ayarlayın
cp .env.example .env
# .env dosyasını doldurun

# 4. Development server başlatın
npm run dev
```

### Önerilen VS Code Eklentileri

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-jest"
  ]
}
```

## 🔄 Katkıda Bulunma Süreci

### 1. Issue Oluşturma/Seçme

- Önce mevcut issues kontrol edin
- Yeni bir özellik için önce issue oluşturun
- `good first issue` etiketli issues'a başlayın

### 2. Branch Oluşturma

```bash
# Main branch'den yeni branch oluşturun
git checkout main
git pull origin main
git checkout -b feature/amazing-feature

# Veya bug fix için
git checkout -b fix/bug-description
```

### 3. Değişiklikleri Yapma

- Küçük, odaklanmış commit'ler yapın
- Açıklayıcı commit mesajları yazın
- Düzenli olarak main branch'den güncelleme alın

```bash
# Commit message formatı
git commit -m "feat: add AI mentor chat interface

- Add chat component with real-time messaging
- Integrate OpenAI API for responses
- Add typing indicators and message status
- Include emoji support and message formatting

Fixes #123"
```

### 4. Test Etme

```bash
# Tüm testleri çalıştır
npm test

# Linting kontrolü
npm run lint

# Type checking
npx tsc --noEmit

# Build test
npm run build
```

## 📏 Kod Standartları

### TypeScript

- **Strict mode** kullanın
- **Interface'ler** type'lar yerine tercih edin
- **Explicit return types** tanımlayın
- **Optional chaining** kullanın

```typescript
// ✅ İyi
interface UserProfile {
  id: string
  name: string
  email?: string
}

const getUserName = (profile: UserProfile): string => {
  return profile.name ?? 'Anonymous'
}

// ❌ Kötü
const getUserName = (profile: any) => {
  return profile.name || 'Anonymous'
}
```

### React Components

- **Functional components** kullanın
- **Custom hooks** ile logic'i ayırın
- **Prop types** tanımlayın
- **Error boundaries** kullanın

```typescript
// ✅ İyi
interface Props {
  title: string
  onClose: () => void
}

export const Modal: React.FC<Props> = ({ title, onClose }) => {
  return (
    <div className="modal">
      <h2>{title}</h2>
      <button onClick={onClose}>Close</button>
    </div>
  )
}

// ❌ Kötü
export const Modal = ({ title, onClose }: any) => {
  return <div>{title}</div>
}
```

### CSS/Styling

- **Tailwind CSS** kullanın
- **Responsive design** uygulayın
- **Dark mode** desteği ekleyin
- **Semantic class names** tercih edin

```tsx
// ✅ İyi
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-4">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
    {title}
  </h2>
</div>

// ❌ Kötü
<div style={{ background: 'white', padding: '24px' }}>
  <h2>{title}</h2>
</div>
```

### File Organization

```
src/
├── components/
│   ├── ui/           # Shared UI components
│   ├── layout/       # Layout components
│   └── feature/      # Feature-specific components
├── pages/            # Page components
├── lib/              # Utilities and services
├── hooks/            # Custom React hooks
├── store/            # State management
└── types/            # TypeScript type definitions
```

## 🧪 Test Yazma

### Unit Tests

```typescript
// components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Tests

```typescript
// pages/__tests__/HomePage.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { HomePage } from '../HomePage'

jest.mock('@/lib/api', () => ({
  getUserPlan: jest.fn(() => Promise.resolve(mockPlan))
}))

describe('HomePage', () => {
  it('should display user plan after loading', async () => {
    render(<HomePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Bugünkü Planım')).toBeInTheDocument()
    })
  })
})
```

### Test Coverage

- **Components** için en az %80 coverage
- **Critical paths** için %100 coverage
- **Happy path + error cases** test edin

## 📥 Pull Request Süreci

### PR Hazırlama

1. **Branch'i güncel tutun**
```bash
git fetch origin
git rebase origin/main
```

2. **Commit history'yi temizleyin**
```bash
git rebase -i HEAD~3  # Son 3 commit'i squash edin
```

3. **Tests ve linting geçiyor mu kontrol edin**
```bash
npm test && npm run lint && npm run build
```

### PR Template Doldurma

- **Açıklama**: Neyi değiştirdiniz?
- **Test**: Nasıl test ettiniz?
- **Screenshots**: UI değişiklikleri varsa
- **Breaking changes**: Var mı?

### Code Review Süreci

1. **Otomatik checks** geçmeli
2. **En az 1 reviewer** onayı
3. **Conflicts** çözülmeli
4. **Documentation** güncellenmeli

## 🐛 Issue Raporlama

### Bug Report

- **Açık başlık** yazın
- **Adım adım repro** steps
- **Beklenen vs gerçek** davranış
- **Ekran görüntüleri** ekleyin
- **Ortam bilgileri** verin (OS, browser, device)

### Feature Request

- **Problem statement** tanımlayın
- **Önerilen çözüm** açıklayın
- **User story** formatı kullanın
- **Mockup/wireframe** ekleyin

## 🏷️ Commit Message Formatı

```
<type>(<scope>): <description>

<body>

<footer>
```

### Types
- `feat`: Yeni özellik
- `fix`: Bug düzeltmesi
- `docs`: Dokümantasyon
- `style`: Kod formatı (logic değişikliği yok)
- `refactor`: Code refactoring
- `test`: Test ekleme/güncelleme
- `chore`: Build process, dependencies

### Örnekler

```bash
feat(auth): add Google OAuth login

- Integrate Google OAuth 2.0
- Add login/logout flow
- Store user session in local storage
- Add error handling for auth failures

Closes #123

fix(ui): resolve mobile navigation menu bug

The hamburger menu was not closing on mobile devices
after navigation. Added click outside handler and
proper state management.

Fixes #456
```

## 🎯 Öncelikli Alanlar

### Kısa Vadeli (1-2 hafta)
- [ ] Mobile responsive issues
- [ ] Performance optimizations
- [ ] Test coverage improvement
- [ ] Accessibility fixes

### Orta Vadeli (1-2 ay)
- [ ] AI mentor improvements
- [ ] Gamification enhancements
- [ ] Offline functionality
- [ ] Real-time collaboration

### Uzun Vadeli (3+ ay)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Enterprise features

## 📞 İletişim

- **GitHub Issues**: Teknik sorular ve bug reports
- **Discussions**: Genel tartışmalar ve sorular
- **Email**: team@yksplan.com

## 🙏 Teşekkürler

YKS Plan'a katkıda bulunduğunuz için teşekkür ederiz! Sizin katkılarınız sayesinde binlerce öğrencinin YKS yolculuğuna yardım ediyoruz.

---

**"En iyi öğretmen deneyimdir, en iyi yol ise birlikte yürümektir." 🚀**
