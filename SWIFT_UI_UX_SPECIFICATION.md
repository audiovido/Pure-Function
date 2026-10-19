# Pure Function — Apple Ecosystem (iOS 16+ & macOS 13+) UI/UX & SwiftUI Architecture Specification

> **Document Version:** 1.0.0  
> **Target Framework:** SwiftUI (Swift 5.9+ / Swift 6)  
> **Platforms:** iOS 16.0+, iPadOS 16.0+, macOS 13.0+ (Universal Multiplatform App)  
> **Design Language:** Apple Human Interface Guidelines (HIG) with Pure Function High-Performance Athletic Theme  
> **Architecture Pattern:** MVVM-C (Model-View-ViewModel-Coordinator) + Protocol-Oriented API Services with Swift Concurrency (`async/await`)

---

## ۱. اهداف و چشم‌انداز محصول (Executive Summary)

اپلیکیشن **Pure Function** یک پلتفرم دوگانه مربی / ورزشکار (Trainer & Athlete Portal) با معماری اختصاصی بر پایه عملکرد فیزیکی و بیومکانیک دقیق است.  
این سند مشخصات فنی، دیزاین سیستم کامل (Tokens, Colors, Spacing, Typography) و راهنمای پیاده‌سازی سورس‌کد به زبان **Swift** و فریم‌ورک **SwiftUI** را برای پشتیبانی بی‌نقص از تمامی دستگاه‌های اپل (از آیفون تا آیپد در حالت Stage Manager و مک‌بوک) بدون هیچ‌گونه شکستگی در ریسپانسیو و کاملاً آماده اتصال به Backend API تعریف می‌کند.

---

## ۲. دیزاین سیستم (Design System & Visual Language)

### ۲.۱ پالت رنگی (Color Tokens)

طراحی بصری بر پایه کنتراست فوق‌العاده بالا، تم تیره ورزشی (Performance Dark) با لهجه‌ی امضای طلایی-خردلی (Pure Amber Gold) و پشتیبانی خودکار از Dynamic Light/Dark Mode است.

| نام توکن در سوئیفت | مقدار Dark Mode | مقدار Light Mode | کاربرد |
| :--- | :--- | :--- | :--- |
| `pfBackground` | `#090B0E` (Deep Obsidian) | `#F8F9FA` (Clean Slate) | پس‌زمینه اصلی پنجره و Viewها |
| `pfSurface` | `#141822` (Subtle Navy Glass) | `#FFFFFF` (Pure Card White) | کادر کارت‌ها، سکشن‌ها و کانتینرها |
| `pfSurfaceSecondary` | `#1A202C` | `#F1F5F9` | باکس‌های ست‌ها، رپس و لود داخل کارت |
| `pfPrimaryAccent` | `#FBBF24` (Amber 400) | `#F59E0B` (Amber 500) | دکمه‌های اصلی (Add, Play, Active Days) |
| `pfAccentHover` | `#FDE68A` (Amber 300) | `#D97706` (Amber 600) | حالت انتخاب و هاور روی مک |
| `pfAccentText` | `#000000` (Pitch Black) | `#000000` | متن روی دکمه‌های امبر جهت خوانایی مطلق |
| `pfBorder` | `#262626` (20% Opacity) | `#E2E8F0` | خطوط تقسیم‌کننده و کادر کارت‌ها |
| `pfTextPrimary` | `#F8FAFC` (Slate 50) | `#0F172A` (Slate 900) | تیتر تمرین‌ها، نام کلاینت و تاریخ |
| `pfTextSecondary` | `#94A3B8` (Slate 400) | `#64748B` (Slate 500) | برچسب ست‌ها، سن و توضیحات فرعی |

```swift
// Swift Implementation: Color Extension
import SwiftUI

public extension Color {
    static let pfBackground = Color("PFBackground")
    static let pfSurface = Color("PFSurface")
    static let pfSurfaceSecondary = Color("PFSurfaceSecondary")
    static let pfPrimaryAccent = Color("PFPrimaryAccent")
    static let pfAccentText = Color("PFAccentText")
    static let pfBorder = Color("PFBorder")
    static let pfTextPrimary = Color("PFTextPrimary")
    static let pfTextSecondary = Color("PFTextSecondary")
}
```

---

### ۲.۲ تایپوگرافی (Typography Scale)

استفاده از سیستم فونت نیتیو اپل **San Francisco (SF Pro)** با ترکینگ فشرده ورزشی و استفاده از ویژگی‌های مونو برای اعداد و ست‌ها:

| توکن | فونت نیتیو سوئیفت | وزن (Weight) | ویژگی | کاربرد |
| :--- | :--- | :--- | :--- | :--- |
| `DisplayLarge` | `.system(size: 26, design: .default)` | `.black` | Condensed Tight | نام کلاینت در تب ورزشکار |
| `HeaderMedium` | `.system(size: 17, design: .default)` | `.bold` | Rounded Caps | تاریخ، نام تمرین در کارت |
| `MetricValue` | `.system(size: 14, design: .rounded)` | `.heavy` | Monospaced digits | اعداد Sets, Reps, Load, Rest |
| `MetricLabel` | `.system(size: 9, design: .default)` | `.bold` | Uppercase | برچسب SETS, REPS, LOAD, REST |
| `ButtonLabel` | `.system(size: 12, design: .default)` | `.bold` | Small | دکمه Add Exercise، فیلترها |

---

### ۲.۳ ابعاد، گوشه‌ها (Corner Radius) و فاصله‌ها (Layout Spacing)

- **گوشه‌ها (Squircle):** اپل از فرم هندسی Continuous Corners (Corner Radius Smoothing) استفاده می‌کند:
  - کارت تمرین و کانتینر اصلی: `.clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))`
  - دکمه‌های Play و متریک‌های ۴گانه: `.clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))`
  - چیپ روزهای تقویم هفتگی: `.clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))`
- **گرید فاصله‌ها:** ضریب‌های ۴ و ۸ پیکسلی: `8pt` (Tight), `12pt` (Base), `16pt` (Comfortable), `24pt` (Section Break).

---

## ۳. معماری رابط کاربری ریسپانسیو (Responsive Multiplatform UX)

برای اطمینان از اینکه هیچ ریسپانسیوی در دستگاه‌های مختلف به هم نریزد:

### ۳.۱ ساختار تطبیقی دستگاه‌ها (Size Classes & Idiom Layout)

```
┌─────────────────────────────────────────────────────────────────┐
│                           macOS & iPad                          │
│ ┌─────────────────────────┬───────────────────────────────────┐ │
│ │ NavigationSplitView     │ Main Workspace (Max Width: 960pt) │ │
│ │ Sidebar (Clients/Menu)  │ 1. CalendarStripView (Week/Month) │ │
│ │                         │ 2. ClientBannerView (Active Info) │ │
│ │                         │ 3. Action Bar (Add Exercise)      │ │
│ │                         │ 4. ExerciseCards LazyVStack       │ │
│ └─────────────────────────┴───────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                             iPhone                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Top Segment: [Trainer] / [Client] Switcher + Theme Toggle   │ │
│ │ 1. CalendarStripView (7-Day Horizontal Swipeable Strip)     │ │
│ │ 2. Client Compact Bar (Tappable Modal Trigger)              │ │
│ │ 3. Action Bar: Left-Aligned Add Exercise Button             │ │
│ │ 4. ExerciseCards (Full Width minus 16pt margin)             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

1. **آیفون (Compact Width):**
   - ویو تک‌صفحه‌ای با اسکرول عمودی نرم.
   - گرید ۴ تایی ست‌ها در ردیف دوم کارت تمرین به صورت اتوماتیک فضای عرض را ۴ تقسیم مساوی می‌کند (`Grid(horizontalSpacing: 8)`).
2. **آیپد و مک (Regular Width & macOS Desktop):**
   - استفاده از کانتینر با حداکثر عرض مجاز (Max Width `860pt` - `960pt`) و ترازبندی در مرکز پنجره (`frame(maxWidth: 960)`).
   - باز شدن مدال‌ها به صورت Native Sheet یا Floating Inspector Panel در macOS.

---

## ۴. مشخصات کامپوننت‌های نیتیو (Component Breakdown)

### ۴.۱ نوار تقویم نیتیو (`CalendarStripView`)
- **حالت Weekly View:**
  - یک ردیف ۷تایی از دوشنبه تا یکشنبه (`LazyHGrid` یا `HStack`).
  - نمایش نام روز (Mon..Sun)، شماره روز ماه (۵..۱۱)، و یک دات زرد رنگ کوچک برای روزهایی که تمرین دارند.
  - روز جاری با هایلایت ملایم و روز انتخاب شده با پس‌زمینه زرد کهربایی و متن مشکی مشخص می‌شود.
- **حالت Monthly View:**
  - یک تقویم ۳۱ روزه با ۷ ستون با انیمیشن ترنزیشن نرم (`withAnimation(.spring())`).
- **دکمه‌های تغییر نما:**
  - سوییچر گوشواره‌ای (Capsule / Segmented) بین `Weekly View` و `Monthly View`.

### ۴.۲ کادر کلاینت در نمای ترینر (`ClientBannerView`)
- در سمت چپ: عکس کلاینت در کادر Squircle ۱۲ پیکسلی + نام ورزشکار (خط اول) + سن (خط دوم زیر نام).
- در سمت راست: بج زرد رنگ `Clients (10) >` که با کلیک روی آن لیست ورزشکاران به صورت Sheet شناور باز می‌شود.

### ۴.۳ دکمه‌ی افزودن تمرین (`AddExerciseBar`)
- تراز شده در **سمت چپ** کارت با فاصله‌گذاری دقیق و تقارن نسبت به خط بالایی و کارت‌های پایین.
- رنگ زرد امبر، آیکون پلاس `Image(systemName: "plus")` و متن بولد `Add Exercise`.

### ۴.۴ کارت تمرین نیتیو (`ExerciseCardView`)
- **ردیف اول (یک خط افقی):**
  - سمت چپ: عنوان تمرین با قابلیت Truncate تمیز در صورت بلند بودن متن.
  - سمت راست: تمام دکمه‌های اکشن به صورت فشرده در یک ردیف:
    1. **دکمه Play زرد رنگ:** کادر Squircle زرد رنگ ۲۸×۲۸ پوینت با آیکون پلی مشکی توپر (`play.fill`).
    2. **دکمه Edit:** مداد جهت ویرایش مشخصات.
    3. **دکمه Copy:** دوپلیکیت تمرین.
    4. **دکمه Delete:** حذف تمرین.
- **ردیف دوم (جعبه‌های متریک ۴ گانه):**
  - گرید ۴ ستونی کامپکت و مساوی: `SETS`، `REPS`، `LOAD`، `REST`.
  - در حالت Trainer: امکان تپ کردن و تغییر مستقیم مقادیر با باز شدن کیبورد عددی.
  - در حالت Client: نمایش تمیز و شیک بدون هیچ فضای پرت یا کادر طوسی اضافه.

---

## ۵. معماری داده و مدل‌های سوئیفت (Swift Models & API Contract)

کلیه مدل‌ها مطابق با استانداردهای نوین سوئیفت (`Codable`, `Identifiable`, `Sendable`, `Hashable`) نوشته شده و ۱۰۰٪ آماده اتصال به هر REST یا GraphQL API هستند:

```swift
import Foundation

// MARK: - Exercise Model
public struct Exercise: Identifiable, Codable, Hashable, Sendable {
    public let id: String
    public var name: String
    public var sets: Int
    public var reps: String
    public var intensity: String
    public var rest: String
    public var notes: String
    public var completed: Bool
    public var category: ExerciseCategory?
    public var durationSeconds: Int?
    public var videoDurationText: String?
    public var youtubeId: String?
    public var cues: [String]?
    
    public init(
        id: String = UUID().uuidString,
        name: String,
        sets: Int = 3,
        reps: String = "8",
        intensity: String = "Bodyweight",
        rest: String = "60s",
        notes: String = "",
        completed: Bool = false,
        category: ExerciseCategory? = nil,
        durationSeconds: Int? = 40,
        videoDurationText: String? = "0:40",
        youtubeId: String? = nil,
        cues: [String]? = nil
    ) {
        self.id = id
        self.name = name
        self.sets = sets
        self.reps = reps
        self.intensity = intensity
        self.rest = rest
        self.notes = notes
        self.completed = completed
        self.category = category
        self.durationSeconds = durationSeconds
        self.videoDurationText = videoDurationText
        self.youtubeId = youtubeId
        self.cues = cues
    }
}

public enum ExerciseCategory: String, Codable, CaseIterable, Sendable {
    case lowerBody = "Lower body"
    case upperBody = "Upper body"
    case core = "Core"
    case mobility = "Mobility"
    case conditioning = "Conditioning"
}

// MARK: - DayWorkout Model
public struct DayWorkout: Identifiable, Codable, Hashable, Sendable {
    public var id: String { date }
    public let date: String // Format: "YYYY-MM-DD"
    public var dayOfWeek: String
    public var dayNumber: Int
    public var fullDayName: String
    public var focus: String?
    public var exercises: [Exercise]
}

// MARK: - ClientProfile Model
public struct ClientProfile: Identifiable, Codable, Hashable, Sendable {
    public let id: String
    public var name: String
    public var age: Int?
    public var email: String
    public var avatarUrl: URL?
    public var membershipStatus: MembershipStatus
    public var goal: String
    public var coach: String
    public var currentProgram: String
}

public enum MembershipStatus: String, Codable, Sendable {
    case active = "Active"
    case deload = "Deload"
    case rehab = "Rehab"
}
```

---

## ۶. لایه سرویس شبکه و اتصال به API (Networking Architecture)

ساختار ماژولار و پروتکل‌محور با استفاده از Native `URLSession` و ساختار مدرن `async/await`:

```swift
import Foundation

public enum APIError: LocalizedError, Sendable {
    case invalidURL
    case networkFailure(Error)
    case decodingFailed(Error)
    case serverError(statusCode: Int)
}

public protocol WorkoutAPIServiceProtocol: Sendable {
    func fetchClients() async throws -> [ClientProfile]
    func fetchWorkouts(for clientId: String, month: String) async throws -> [DayWorkout]
    func addExercise(_ exercise: Exercise, for date: String, clientId: String) async throws -> DayWorkout
    func updateExercise(_ exercise: Exercise, on date: String, clientId: String) async throws -> Exercise
    func deleteExercise(id: String, on date: String, clientId: String) async throws -> Bool
}

public final class WorkoutAPIService: WorkoutAPIServiceProtocol {
    private let baseURL: URL
    private let session: URLSession

    public init(baseURL: URL = URL(string: "https://api.purefunction.fit/v1")!, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    public func fetchClients() async throws -> [ClientProfile] {
        let endpoint = baseURL.appendingPathComponent("/clients")
        let (data, response) = try await session.data(from: endpoint)
        guard let httpResponse = response as? HTTPURLResponse, 200..<300 ~= httpResponse.statusCode else {
            throw APIError.serverError(statusCode: (response as? HTTPURLResponse)?.statusCode ?? 500)
        }
        return try JSONDecoder().decode([ClientProfile].self, from: data)
    }

    public func fetchWorkouts(for clientId: String, month: String) async throws -> [DayWorkout] {
        let endpoint = baseURL.appendingPathComponent("/clients/\(clientId)/workouts?month=\(month)")
        let (data, _) = try await session.data(from: endpoint)
        return try JSONDecoder().decode([DayWorkout].self, from: data)
    }

    public func addExercise(_ exercise: Exercise, for date: String, clientId: String) async throws -> DayWorkout {
        // Generic POST request implementation
        fatalError("Implement standard POST to /workouts/exercise")
    }

    public func updateExercise(_ exercise: Exercise, on date: String, clientId: String) async throws -> Exercise {
        // Generic PUT/PATCH request implementation
        fatalError("Implement standard PATCH to /workouts/exercise/\(exercise.id)")
    }

    public func deleteExercise(id: String, on date: String, clientId: String) async throws -> Bool {
        // Generic DELETE request implementation
        fatalError("Implement standard DELETE")
    }
}
```

---

## ۷. نقشه راه پیاده‌سازی گام‌به‌گام سوئیفت (Swift Roadmap & File Structure)

ساختار پیشنهادی پروژه Xcode به صورت Clean Architecture:

```
PureFunction/
├── App/
│   ├── PureFunctionApp.swift           // App Entry Point
│   └── AppState.swift                  // Global Navigation & Auth State
├── DesignSystem/
│   ├── Colors.swift                    // Dynamic Color Tokens (Dark & Light)
│   ├── Typography.swift                // Font Styles & Sizes
│   └── Components/
│       ├── PFButton.swift              // Amber Accent Buttons
│       └── PFIconButton.swift          // Icon Action Buttons
├── Models/
│   ├── Exercise.swift                  // Codable Models
│   ├── DayWorkout.swift
│   └── ClientProfile.swift
├── Services/
│   ├── APIEndpoint.swift               // REST Endpoints
│   ├── WorkoutAPIService.swift         // Network Client
│   └── MockWorkoutService.swift        // Offline & Preview Data
├── ViewModels/
│   ├── WorkoutViewModel.swift          // State Management for Calendar & Exercises
│   └── ClientRosterViewModel.swift     // Athlete Selection & Profiles
└── Views/
    ├── MainRootView.swift              // Adaptive Split View / Stack
    ├── Calendar/
    │   ├── CalendarStripView.swift     // 7-Day & 31-Day Interactive Grid
    │   └── CalendarDayCell.swift       // Individual Day Pill with Status Dot
    ├── Trainer/
    │   ├── TrainerView.swift           // Coach Dashboard
    │   ├── ClientBannerView.swift      // Athlete Summary Card
    │   └── ExerciseCardView.swift      // Single Exercise with Row Actions
    ├── Client/
    │   └── ClientView.swift            // Athlete Portal View
    └── Modals/
        ├── ExerciseLibrarySheet.swift  // Minimalist Exercise Picker
        ├── VideoPlayerView.swift       // Real Video Player (AVPlayer / WebKit)
        └── ClientPickerSheet.swift     // Minimal Athlete Selector
```

---

## ۸. چک‌لیست استانداردهای جهانی اپل (Apple Standards Compliance)

- [x] **Dynamic Type Support:** تمامی فونت‌ها با قابلیت بزرگنمایی در Accessibility هماهنگ هستند.
- [x] **Dark / Light Appearance:** سوییچ اتوماتیک بین پالت تیره مشکی-امبر و روشن با رعایت کامل Contrast Ratio استاندارد WCAG AAA.
- [x] **Haptic Feedback:** در iOS در زمان تپ روی تغییر روز تقویم و کلیک دکمه‌ها از `UIImpactFeedbackGenerator(style: .light)` استفاده می‌شود.
- [x] **Keyboard Avoidance:** در زمان ادیت ست‌ها و رپس‌ها، ویو با استفاده از Native `.keyboardAdaptive()` بالا می‌آید.
- [x] **San Francisco SF Symbols:** استفاده از آیکون‌های استاندارد اپل (`play.fill`, `plus`, `square.and.pencil`, `trash`, `doc.on.doc`).
