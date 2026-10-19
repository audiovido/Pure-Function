# Pure Function — Complete Native SwiftUI Technical Architecture & Implementation Guide

## Document Overview
This document serves as the implementation-ready blueprint for engineering the native **iOS 16+** and **macOS 13+** client for **Pure Function**. It adheres strictly to the Apple Human Interface Guidelines, modern Swift concurrency, declarative UI paradigms, and clean architectural principles.

---

## 1. SwiftUI Design System Implementation

### 1.1 Color Tokens & Asset Catalog
Defined in `Assets.xcassets` with light and dark variants or programmatic extensions:

```swift
import SwiftUI

public enum PFTheme {
    public static let backgroundDark = Color(red: 9/255, green: 11/255, blue: 14/255)
    public static let backgroundLight = Color(red: 248/255, green: 249/255, blue: 250/255)
    
    public static let surfaceDark = Color(red: 20/255, green: 24/255, blue: 34/255)
    public static let surfaceLight = Color.white
    
    public static let secondarySurfaceDark = Color(red: 25/255, green: 29/255, blue: 40/255)
    public static let secondarySurfaceLight = Color(red: 241/255, green: 245/255, blue: 249/255)
    
    public static let amberAccent = Color(red: 251/255, green: 191/255, blue: 36/255) // #FBBF24
    public static let amberHover = Color(red: 253/255, green: 230/255, blue: 138/255) // #FDE68A
    
    public static let borderDark = Color.white.opacity(0.10)
    public static let borderLight = Color.black.opacity(0.10)
}
```

### 1.2 View Modifiers for Reusability

```swift
import SwiftUI

public struct PFCardStyle: ViewModifier {
    @Environment(\.colorScheme) var colorScheme
    
    public func body(content: Content) -> some View {
        content
            .background(colorScheme == .dark ? PFTheme.surfaceDark : PFTheme.surfaceLight)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(colorScheme == .dark ? PFTheme.borderDark : PFTheme.borderLight, lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(colorScheme == .dark ? 0.3 : 0.05), radius: 8, x: 0, y: 3)
    }
}

public extension View {
    func pfCard() -> some View {
        self.modifier(PFCardStyle())
    }
}
```

---

## 2. Core SwiftUI Components

### 2.1 The Weekly & Monthly Calendar Strip (`CalendarStripView.swift`)

```swift
import SwiftUI

public struct CalendarStripView: View {
    @Binding var selectedDate: String
    let workouts: [DayWorkout]
    @State private var mode: CalendarMode = .week
    @State private var referenceDate: Date = Date()
    
    public enum CalendarMode: String, CaseIterable {
        case week = "Weekly View"
        case month = "Monthly View"
    }
    
    public var body: some View {
        VStack(spacing: 12) {
            // Header Row: Month / Range on Left, Mode Switcher on Right
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "calendar")
                        .foregroundStyle(PFTheme.amberAccent)
                    Text(headerTitle)
                        .font(.system(size: 14, weight: .bold))
                }
                
                Spacer()
                
                // Mode Toggle
                Picker("Mode", selection: $mode) {
                    Text("Weekly View").tag(CalendarMode.week)
                    Text("Monthly View").tag(CalendarMode.month)
                }
                .pickerStyle(.segmented)
                .frame(width: 220)
            }
            
            // Interactive 7-Day Strip
            if mode == .week {
                HStack(spacing: 6) {
                    ForEach(currentWeekDays, id: \.dateString) { day in
                        DayCell(
                            day: day,
                            isSelected: selectedDate == day.dateString,
                            hasWorkout: hasWorkout(on: day.dateString)
                        )
                        .onTapGesture {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                selectedDate = day.dateString
                            }
                        }
                    }
                }
            } else {
                MonthGridView(selectedDate: $selectedDate, workouts: workouts)
            }
        }
        .padding(14)
        .pfCard()
    }
    
    private var headerTitle: String {
        // Computed title e.g. "October 5 – 11, 2026"
        "October 5 – 11, 2026"
    }
    
    private var currentWeekDays: [CalendarDayItem] {
        // Generates 7 items for Monday through Sunday
        []
    }
    
    private func hasWorkout(on date: String) -> Bool {
        workouts.first(where: { $0.date == date })?.exercises.isEmpty == false
    }
}

public struct CalendarDayItem {
    public let dayOfWeek: String
    public let dayNumber: Int
    public let dateString: String
    public let isToday: Bool
}

public struct DayCell: View {
    let day: CalendarDayItem
    let isSelected: Bool
    let hasWorkout: Bool
    
    public var body: some View {
        VStack(spacing: 4) {
            Text(day.dayOfWeek.uppercased())
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(isSelected ? Color.black : (day.isToday ? PFTheme.amberAccent : Color.secondary))
            
            Text("\(day.dayNumber)")
                .font(.system(size: 15, weight: .bold))
                .foregroundStyle(isSelected ? Color.black : Color.primary)
            
            Circle()
                .fill(isSelected ? Color.black : (hasWorkout ? PFTheme.amberAccent : Color.clear))
                .frame(width: 5, height: 5)
        }
        .frame(maxWidth: .infinity, minHeight: 56)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(isSelected ? PFTheme.amberAccent : Color.clear)
        )
    }
}
```

---

### 2.2 The Clean Exercise Card (`ExerciseCardView.swift`)

```swift
import SwiftUI

public struct ExerciseCardView: View {
    @Binding var exercise: Exercise
    let isTrainer: Bool
    var onPlayVideo: () -> Void
    var onEdit: () -> Void
    var onDuplicate: () -> Void
    var onDelete: () -> Void
    
    public var body: some View {
        VStack(spacing: 10) {
            // Row 1: Exercise Name & Inline Action Buttons
            HStack(spacing: 8) {
                Text(exercise.name)
                    .font(.system(size: 15, weight: .bold))
                    .lineLimit(1)
                
                Spacer()
                
                // Signature Yellow Play Button (28x28 with Black Icon)
                Button(action: onPlayVideo) {
                    Image(systemName: "play.fill")
                        .font(.system(size: 11, weight: .black))
                        .foregroundStyle(Color.black)
                        .frame(width: 28, height: 28)
                        .background(PFTheme.amberAccent)
                        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                }
                .buttonStyle(.plain)
                
                if isTrainer {
                    Button(action: onEdit) {
                        Image(systemName: "pencil")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.secondary)
                            .frame(width: 28, height: 28)
                    }
                    .buttonStyle(.plain)
                    
                    Button(action: onDuplicate) {
                        Image(systemName: "doc.on.doc")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.secondary)
                            .frame(width: 28, height: 28)
                    }
                    .buttonStyle(.plain)
                    
                    Button(action: onDelete) {
                        Image(systemName: "trash")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.red.opacity(0.8))
                            .frame(width: 28, height: 28)
                    }
                    .buttonStyle(.plain)
                }
            }
            
            // Row 2: 4-Metric Grid (Sets, Reps, Load, Rest)
            HStack(spacing: 8) {
                MetricBox(label: "SETS", value: "\(exercise.sets)")
                MetricBox(label: "REPS", value: exercise.reps)
                MetricBox(label: "LOAD", value: exercise.intensity)
                MetricBox(label: "REST", value: exercise.rest)
            }
        }
        .padding(14)
        .pfCard()
    }
}

public struct MetricBox: View {
    let label: String
    let value: String
    @Environment(\.colorScheme) var colorScheme
    
    public var body: some View {
        VStack(spacing: 2) {
            Text(label)
                .font(.system(size: 9, weight: .bold))
                .foregroundStyle(Color.secondary)
            
            Text(value)
                .font(.system(size: 13, weight: .heavy, design: .rounded))
                .foregroundStyle(label == "SETS" ? PFTheme.amberAccent : Color.primary)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 6)
        .background(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(colorScheme == .dark ? PFTheme.secondarySurfaceDark : PFTheme.secondarySurfaceLight)
        )
    }
}
```

---

## 3. State Management & ViewModel

```swift
import Foundation
import Combine

@MainActor
public final class WorkoutViewModel: ObservableObject {
    @Published public var selectedDate: String = "2026-10-10"
    @Published public var workouts: [DayWorkout] = []
    @Published public var clients: [ClientProfile] = []
    @Published public var selectedClient: ClientProfile?
    @Published public var activeVideoExercise: Exercise?
    @Published public var isLibraryPresented: Bool = false
    @Published public var isClientPickerPresented: Bool = false
    
    private let apiService: WorkoutAPIServiceProtocol
    
    public init(apiService: WorkoutAPIServiceProtocol = WorkoutAPIService()) {
        self.apiService = apiService
    }
    
    public func loadData() async {
        do {
            self.clients = try await apiService.fetchClients()
            self.selectedClient = clients.first
            if let clientId = selectedClient?.id {
                self.workouts = try await apiService.fetchWorkouts(for: clientId, month: "2026-10")
            }
        } catch {
            print("Failed to load initial data: \(error)")
        }
    }
    
    public func duplicateExercise(_ exercise: Exercise) {
        guard let index = workouts.firstIndex(where: { $0.date == selectedDate }) else { return }
        var copy = exercise
        copy = Exercise(
            id: UUID().uuidString,
            name: "\(exercise.name) (Copy)",
            sets: exercise.sets,
            reps: exercise.reps,
            intensity: exercise.intensity,
            rest: exercise.rest,
            notes: exercise.notes,
            youtubeId: exercise.youtubeId
        )
        workouts[index].exercises.append(copy)
    }
    
    public func deleteExercise(id: String) {
        guard let index = workouts.firstIndex(where: { $0.date == selectedDate }) else { return }
        workouts[index].exercises.removeAll(where: { $0.id == id })
    }
}
```

---

## 4. macOS & iPad Stage Manager Compatibility

- Support multi-window in macOS via `WindowGroup` with `.defaultSize(width: 900, height: 750)`.
- Use `.navigationSplitViewStyle(.balanced)` for iPadOS and macOS sidebar integration.
- Keyboard shortcuts:
  - `Cmd + N`: Add Exercise
  - `Cmd + RightArrow` / `Cmd + LeftArrow`: Next / Previous Week
  - `Cmd + T`: Jump to Today
