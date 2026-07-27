# CarePilot Design System

**Version:** 2.0.0 **Last Updated:** July 2026

> This document is the single source of truth for CarePilot's design
> language. It is intended for designers, developers, and AI coding
> assistants.

# 1. Product Vision

CarePilot is an AI-first healthcare coordination platform for
independent practitioners. The experience is calm, trustworthy,
conversational, and premium while maintaining exceptional usability and
accessibility.

## Core Design Principles

-   Mobile-first
-   Calm and trustworthy
-   Content before decoration
-   One primary action per screen
-   Card-first layouts
-   Progressive disclosure
-   AI assists without interrupting
-   Accessibility by default
-   Consistency over novelty
-   Thumb-friendly interactions

# 2. Platform

-   iOS + Android
-   390px reference width
-   Safe-area aware
-   8pt grid
-   Minimum touch target: 44×44

# 3. Foundations

## Brand Colors

Primary: #B8FF3D

Background: #F7F6F3 Surface: #FFFFFF Surface Alt: #F2F3F5 Divider:
#ECECEC

Text Primary: #111111 Text Secondary: #666666 Text Tertiary: #999999
Disabled: #CFCFCF

Semantic: - Success #6BCB77 - Warning #FFB020 - Error #E5484D - Info
#4B8DFF

## Typography

Fonts: - SF Pro Display - Inter

Scale

Display XL 40 Bold Display 32 Bold H1 28 Bold H2 24 Semibold H3 20
Semibold Title 18 Semibold Body Large 16 Regular Body 14 Regular Caption
12 Regular Micro 10 Medium

Use tabular numbers for metrics.

## Spacing

4,8,12,16,20,24,32,40,48,56,64,80,96

Outer Margin:24 Card Padding:20 Section Gap:24

## Radius

XS 8 SM 12 MD 16 LG 20 XL 28 2XL 32 Pill 999

## Elevation

Level0 None Level1 Soft Level2 Card Level3 Floating Overlay Modal

# 4. Motion

Fast 150ms Standard 250ms Complex 350ms

Use subtle spring animations for cards and bottom sheets.

# 5. Accessibility

-   WCAG AA
-   Dynamic Type
-   Reduced Motion
-   Screen Reader labels
-   High contrast support
-   Semantic colors
-   Visible focus states

# 6. Component Library

## Foundation

Colors Typography Spacing Radius Elevation Icons Design Tokens

## Core Components

Buttons Inputs Search Cards Avatar Badges Chips Tabs Segmented Control
Progress Slider Calendar Date Picker Bottom Navigation Top App Bar
Drawer Bottom Sheet Dialogs Toast FAB Status Badge Loading Skeleton
Empty State

## Healthcare Components

Appointment Card Doctor Card Patient Card Timeline Calendar Strip Vitals
Card Prescription Card Visit Summary Medical Notes

## AI Components (Milo)

Greeting Bubble Prompt Composer Streaming Message Suggestion Card
Recommendation Card Reminder Card Thinking Indicator Waiting State
Celebration Alert Error Quick Reply Chips Generated Summary Action Card

# 7. Navigation

Bottom Navigation: - Home - Calendar - Milo - Patients

Drawer: - Settings - Manage Clinic - Contact Support - Share - Rate -
Privacy - Terms - Logout

# 8. Data Visualization

Supported: - KPI Cards - Line Charts - Bar Charts - Donut Charts -
Progress Rings - Sparklines

# 9. Design Tokens

colors/* spacing/* radius/* typography/* shadow/* motion/* opacity/*
z-index/*

Compatible with: - Figma Variables - React Native - Flutter - SwiftUI -
CSS Variables

# 10. Naming Convention

Component/Variant/State

Examples: Button/Primary Button/Ghost Card/Appointment AI/Thinking
Input/Search

# 11. Documentation Standard

Each component includes: - Purpose - Anatomy - Variants - States -
Spacing - Accessibility - Do - Don't - Code Mapping

# 12. Keywords

Minimal, Soft UI, Spacious, Editorial, Rounded, Premium, AI-first,
Apple-inspired, Card-based, Healthcare, Low Cognitive Load,
Conversational, Accessible.

# 13. Vibe Coding Rules

-   Never invent new spacing values.
-   Always use design tokens.
-   Reuse existing components before creating new ones.
-   Preserve typography hierarchy.
-   Keep one primary action per screen.
-   Use Milo components consistently.
-   Prefer composition over customization.
-   New screens must not introduce new visual styles unless the design
    system evolves.

# Quality Checklist

✓ Token driven ✓ Accessible ✓ Mobile first ✓ AI ready ✓ Developer ready
✓ Figma Variables compatible ✓ shadcn-inspired component architecture
