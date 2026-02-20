import { useCallback } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "ko" | "ja";

export const LOCALE_LABELS: Record<Locale, string> = {
    en: "English",
    ko: "한국어",
    ja: "日本語",
};

// ─── Translation keys ─────────────────────────────────────

const translations = {
    // App Header
    "app.name": { en: "Focus Valley", ko: "Focus Valley", ja: "Focus Valley" },
    "header.darkMode": { en: "Toggle dark mode", ko: "다크 모드 전환", ja: "ダークモード切替" },
    "header.settings": { en: "Timer settings", ko: "타이머 설정", ja: "タイマー設定" },
    "header.todo": { en: "To-do list", ko: "할 일 목록", ja: "やることリスト" },
    "header.garden": { en: "My garden", ko: "나의 정원", ja: "マイガーデン" },
    "header.history": { en: "Stats & history", ko: "통계 & 기록", ja: "統計 & 履歴" },
    "header.signIn": { en: "Sign in", ko: "로그인", ja: "ログイン" },
    "header.account": { en: "Account", ko: "계정", ja: "アカウント" },

    // Timer
    "timer.focus": { en: "Focus", ko: "집중", ja: "集中" },
    "timer.shortBreak": { en: "Short Break", ko: "짧은 휴식", ja: "短い休憩" },
    "timer.longBreak": { en: "Long Break", ko: "긴 휴식", ja: "長い休憩" },
    "timer.start": { en: "Start", ko: "시작", ja: "スタート" },
    "timer.pause": { en: "Pause", ko: "일시정지", ja: "一時停止" },
    "timer.reset": { en: "Reset", ko: "리셋", ja: "リセット" },
    "timer.skip": { en: "Skip", ko: "건너뛰기", ja: "スキップ" },
    "timer.switchFocus": { en: "Switch to Focus mode", ko: "집중 모드로 전환", ja: "集中モードに切替" },
    "timer.switchShort": { en: "Switch to Short Break mode", ko: "짧은 휴식 모드로 전환", ja: "短い休憩モードに切替" },
    "timer.switchLong": { en: "Switch to Long Break mode", ko: "긴 휴식 모드로 전환", ja: "長い休憩モードに切替" },

    // Plant
    "plant.seed": { en: "SEED", ko: "씨앗", ja: "種" },
    "plant.sprout": { en: "SPROUT", ko: "새싹", ja: "芽" },
    "plant.bud": { en: "BUD", ko: "봉오리", ja: "つぼみ" },
    "plant.flower": { en: "FLOWER", ko: "꽃", ja: "花" },
    "plant.tree": { en: "TREE", ko: "나무", ja: "木" },
    "plant.dead": { en: "DEAD", ko: "시든", ja: "枯れ" },

    // Toast messages
    "toast.focusComplete": { en: "Focus complete! Your plant has grown.", ko: "집중 완료! 식물이 자랐어요.", ja: "集中完了！植物が育ちました。" },
    "toast.breakOver": { en: "Break is over! Ready to focus?", ko: "휴식 끝! 집중할 준비 됐나요?", ja: "休憩終了！集中する準備はできましたか？" },
    "toast.harvested": { en: "Harvested! +1 to your garden", ko: "수확 완료! 정원에 +1", ja: "収穫完了！ガーデンに+1" },
    "toast.plantDied": { en: "Plant withered...", ko: "식물이 시들었어요...", ja: "植物が枯れてしまいました..." },
    "toast.newSeed": { en: "New seed planted!", ko: "새 씨앗을 심었어요!", ja: "新しい種を植えました！" },
    "toast.unlocked": { en: "New plant unlocked:", ko: "새 식물 잠금 해제:", ja: "新しい植物がアンロック:" },

    // Confirm modal
    "confirm.giveUpTitle": { en: "Give up?", ko: "포기할까요?", ja: "諦めますか？" },
    "confirm.giveUpMessage": { en: "Your plant will wither and die. Are you sure?", ko: "식물이 시들어 죽게 됩니다. 정말 포기할까요?", ja: "植物が枯れてしまいます。本当に諦めますか？" },
    "confirm.giveUp": { en: "Give Up", ko: "포기", ja: "諦める" },
    "confirm.keepGoing": { en: "Keep Going", ko: "계속하기", ja: "続ける" },

    // Footer
    "footer.sounds": { en: "Sounds", ko: "사운드", ja: "サウンド" },
    "footer.privacy": { en: "Privacy", ko: "개인정보", ja: "プライバシー" },
    "footer.terms": { en: "Terms", ko: "이용약관", ja: "利用規約" },
    "footer.support": { en: "Support", ko: "후원", ja: "サポート" },

    // Settings panel
    "settings.title": { en: "Timer Settings", ko: "타이머 설정", ja: "タイマー設定" },
    "settings.focusDuration": { en: "Focus Duration", ko: "집중 시간", ja: "集中時間" },
    "settings.shortBreakDuration": { en: "Short Break", ko: "짧은 휴식", ja: "短い休憩" },
    "settings.longBreakDuration": { en: "Long Break", ko: "긴 휴식", ja: "長い休憩" },
    "settings.dailyGoal": { en: "Daily Goal", ko: "일일 목표", ja: "デイリー目標" },
    "settings.autoAdvance": { en: "Auto-advance", ko: "자동 진행", ja: "自動進行" },
    "settings.resetDefaults": { en: "Reset to Defaults", ko: "기본값으로 초기화", ja: "デフォルトに戻す" },
    "settings.minutes": { en: "min", ko: "분", ja: "分" },
    "settings.language": { en: "Language", ko: "언어", ja: "言語" },

    // History panel
    "history.title": { en: "Stats & History", ko: "통계 & 기록", ja: "統計 & 履歴" },
    "history.totalFocus": { en: "Total Focus", ko: "총 집중 시간", ja: "合計集中時間" },
    "history.sessions": { en: "Sessions", ko: "세션", ja: "セッション" },
    "history.currentStreak": { en: "Current Streak", ko: "현재 스트릭", ja: "連続記録" },
    "history.bestStreak": { en: "Best Streak", ko: "최고 스트릭", ja: "最高連続記録" },
    "history.thisWeek": { en: "This Week", ko: "이번 주", ja: "今週" },
    "history.categories": { en: "Categories", ko: "카테고리", ja: "カテゴリー" },
    "history.noSessions": { en: "No focus sessions yet", ko: "아직 집중 세션이 없어요", ja: "まだ集中セッションがありません" },
    "history.share": { en: "Share", ko: "공유", ja: "共有" },
    "history.export": { en: "Export", ko: "내보내기", ja: "エクスポート" },
    "history.days": { en: "days", ko: "일", ja: "日" },
    "history.hours": { en: "h", ko: "시간", ja: "時間" },
    "history.minutesShort": { en: "m", ko: "분", ja: "分" },

    // Garden collection
    "garden.title": { en: "My Garden", ko: "나의 정원", ja: "マイガーデン" },
    "garden.collected": { en: "Collected", ko: "수집", ja: "コレクション" },
    "garden.plants": { en: "plants", ko: "식물", ja: "植物" },
    "garden.locked": { en: "Locked", ko: "잠김", ja: "ロック中" },
    "garden.streakToUnlock": { en: "day streak to unlock", ko: "일 연속으로 잠금 해제", ja: "日連続でアンロック" },

    // Todo panel
    "todo.title": { en: "To-Do", ko: "할 일", ja: "やること" },
    "todo.addPlaceholder": { en: "Add a task...", ko: "할 일 추가...", ja: "タスクを追加..." },
    "todo.clearCompleted": { en: "Clear completed", ko: "완료 항목 삭제", ja: "完了を削除" },
    "todo.setActive": { en: "Set as focus task", ko: "집중 과제로 설정", ja: "集中タスクに設定" },

    // Auth
    "auth.signIn": { en: "Sign In", ko: "로그인", ja: "ログイン" },
    "auth.createAccount": { en: "Create Account", ko: "계정 만들기", ja: "アカウント作成" },
    "auth.signOut": { en: "Sign Out", ko: "로그아웃", ja: "ログアウト" },
    "auth.continueGoogle": { en: "Continue with Google", ko: "Google로 계속", ja: "Googleで続行" },
    "auth.email": { en: "Email", ko: "이메일", ja: "メール" },
    "auth.password": { en: "Password", ko: "비밀번호", ja: "パスワード" },
    "auth.noAccount": { en: "Don't have an account?", ko: "계정이 없으신가요?", ja: "アカウントをお持ちでないですか？" },
    "auth.hasAccount": { en: "Already have an account?", ko: "이미 계정이 있으신가요?", ja: "アカウントをお持ちですか？" },
    "auth.signUp": { en: "Sign up", ko: "가입하기", ja: "登録" },
    "auth.checkEmail": { en: "Check your email to confirm your account!", ko: "이메일을 확인하여 계정을 인증해주세요!", ja: "メールを確認してアカウントを認証してください！" },
    "auth.syncInfo": { en: "Sign in to sync your garden and progress across devices", ko: "로그인하여 기기 간 정원과 진행 상황을 동기화하세요", ja: "ログインしてデバイス間でガーデンと進捗を同期" },

    // Cloud sync
    "sync.title": { en: "Cloud Sync", ko: "클라우드 동기화", ja: "クラウド同期" },
    "sync.description": { en: "Sync your garden, stats, settings, and todos across devices.", ko: "기기 간 정원, 통계, 설정, 할 일을 동기화합니다.", ja: "デバイス間でガーデン、統計、設定、タスクを同期します。" },
    "sync.now": { en: "Sync Now", ko: "지금 동기화", ja: "今すぐ同期" },
    "sync.syncing": { en: "Syncing...", ko: "동기화 중...", ja: "同期中..." },
    "sync.never": { en: "Never", ko: "없음", ja: "なし" },
    "sync.justNow": { en: "Just now", ko: "방금", ja: "たった今" },
    "sync.pushed": { en: "Data uploaded to cloud", ko: "데이터가 클라우드에 업로드됨", ja: "データがクラウドにアップロードされました" },
    "sync.pulled": { en: "Data downloaded from cloud", ko: "클라우드에서 데이터 다운로드됨", ja: "クラウドからデータがダウンロードされました" },
    "sync.merged": { en: "Data synced across devices", ko: "기기 간 데이터 동기화 완료", ja: "デバイス間でデータが同期されました" },
    "sync.upToDate": { en: "Already up to date", ko: "이미 최신 상태입니다", ja: "すでに最新です" },
    "sync.failed": { en: "Sync failed. Please try again.", ko: "동기화 실패. 다시 시도해주세요.", ja: "同期に失敗しました。もう一度お試しください。" },

    // Onboarding
    "onboarding.welcome": { en: "Welcome to Focus Valley", ko: "Focus Valley에 오신 걸 환영해요", ja: "Focus Valleyへようこそ" },
    "onboarding.welcomeDesc": { en: "A Pomodoro timer that grows your garden as you focus. Stay productive and watch your plants flourish.", ko: "집중하면 정원이 자라는 뽀모도로 타이머. 생산적인 시간을 보내며 식물이 자라는 걸 지켜보세요.", ja: "集中するとガーデンが育つポモドーロタイマー。生産的な時間を過ごしながら植物の成長を見守りましょう。" },
    "onboarding.focusGrow": { en: "Focus & Grow", ko: "집중 & 성장", ja: "集中 & 成長" },
    "onboarding.focusGrowDesc": { en: "Start a focus session and your plant grows in real-time. Complete the session to harvest it into your collection.", ko: "집중 세션을 시작하면 식물이 실시간으로 자라요. 세션을 완료하면 컬렉션에 수확할 수 있어요.", ja: "集中セッションを始めると植物がリアルタイムで育ちます。セッションを完了してコレクションに収穫しましょう。" },
    "onboarding.sounds": { en: "Ambient Sounds", ko: "앰비언트 사운드", ja: "環境音" },
    "onboarding.soundsDesc": { en: "Mix rain, fire, cafe, and stream sounds to create your perfect focus environment. Find the Sounds button at the bottom.", ko: "비, 불, 카페, 시냇물 소리를 믹스해서 완벽한 집중 환경을 만들어보세요. 하단의 사운드 버튼을 찾아보세요.", ja: "雨、火、カフェ、小川の音をミックスして完璧な集中環境を作りましょう。下部のサウンドボタンを見つけてください。" },
    "onboarding.buildGarden": { en: "Build Your Garden", ko: "나만의 정원 만들기", ja: "あなたのガーデンを作ろう" },
    "onboarding.buildGardenDesc": { en: "Track categories, maintain streaks, and unlock rare plants. Your progress syncs across devices when signed in.", ko: "카테고리를 추적하고, 스트릭을 유지하며, 희귀 식물을 잠금 해제하세요. 로그인하면 기기 간 진행 상황이 동기화돼요.", ja: "カテゴリーを追跡し、連続記録を維持し、レアな植物をアンロックしましょう。ログインすればデバイス間で進捗が同期されます。" },
    "onboarding.next": { en: "Next", ko: "다음", ja: "次へ" },
    "onboarding.getStarted": { en: "Get Started", ko: "시작하기", ja: "始めましょう" },
    "onboarding.skip": { en: "Skip", ko: "건너뛰기", ja: "スキップ" },

    // Categories
    "category.study": { en: "Study", ko: "공부", ja: "勉強" },
    "category.code": { en: "Code", ko: "코딩", ja: "コーディング" },
    "category.read": { en: "Read", ko: "독서", ja: "読書" },
    "category.work": { en: "Work", ko: "업무", ja: "仕事" },
    "category.design": { en: "Design", ko: "디자인", ja: "デザイン" },
    "category.exercise": { en: "Exercise", ko: "운동", ja: "運動" },
    "category.addCustom": { en: "Add custom category", ko: "커스텀 카테고리 추가", ja: "カスタムカテゴリー追加" },

    // Install banner
    "install.message": { en: "Install Focus Valley for quick access", ko: "Focus Valley를 설치하여 빠르게 접근하세요", ja: "Focus Valleyをインストールして素早くアクセス" },
    "install.button": { en: "Install", ko: "설치", ja: "インストール" },

    // Shortcuts
    "shortcuts.title": { en: "Keyboard Shortcuts", ko: "키보드 단축키", ja: "キーボードショートカット" },

    // Timer — short labels (mobile tabs)
    "timer.shortBreakShort": { en: "Short", ko: "짧은", ja: "短" },
    "timer.longBreakShort": { en: "Long", ko: "긴", ja: "長" },
    "timer.next": { en: "Next", ko: "다음", ja: "次へ" },

    // Settings
    "settings.settings": { en: "Settings", ko: "설정", ja: "設定" },

    // Category modal
    "category.newCategory": { en: "New Category", ko: "새 카테고리", ja: "新カテゴリー" },
    "category.categoryName": { en: "Category name", ko: "카테고리 이름", ja: "カテゴリー名" },
    "category.emoji": { en: "Emoji", ko: "이모지", ja: "絵文字" },
    "category.color": { en: "Color", ko: "색상", ja: "カラー" },
    "category.cancel": { en: "Cancel", ko: "취소", ja: "キャンセル" },
    "category.add": { en: "Add", ko: "추가", ja: "追加" },

    // Auth extras
    "auth.or": { en: "or", ko: "또는", ja: "または" },
    "auth.account": { en: "Account", ko: "계정", ja: "アカウント" },

    // Loading / misc
    "footer.loadingSounds": { en: "Loading sounds", ko: "사운드 로딩 중", ja: "サウンド読み込み中" },
    "footer.hideSounds": { en: "Hide ambient sounds", ko: "앰비언트 사운드 숨기기", ja: "環境音を隠す" },
    "footer.openSounds": { en: "Open ambient sounds", ko: "앰비언트 사운드 열기", ja: "環境音を開く" },

    // Notifications
    "notification.focusComplete": { en: "Focus session complete! Your plant has grown.", ko: "집중 세션 완료! 식물이 자랐어요.", ja: "集中セッション完了！植物が育ちました。" },
    "notification.breakOver": { en: "Break is over! Time to focus.", ko: "휴식이 끝났어요! 집중할 시간이에요.", ja: "休憩終了！集中する時間です。" },

    // Plant Garden
    "plant.tapToPlant": { en: "Tap to plant a new seed", ko: "탭하여 새 씨앗 심기", ja: "タップして新しい種を植える" },
    "plant.tapToHarvest": { en: "Tap to harvest", ko: "탭하여 수확하기", ja: "タップして収穫" },
    "plant.harvestLabel": { en: "Harvest your plant", ko: "식물 수확하기", ja: "植物を収穫" },
    "plant.plantSeedLabel": { en: "Plant a new seed", ko: "새 씨앗 심기", ja: "新しい種を植える" },

    // Plant type names
    "plantType.DEFAULT": { en: "Fern", ko: "고사리", ja: "シダ" },
    "plantType.CACTUS": { en: "Cactus", ko: "선인장", ja: "サボテン" },
    "plantType.SUNFLOWER": { en: "Sunflower", ko: "해바라기", ja: "ひまわり" },
    "plantType.PINE": { en: "Bonsai", ko: "분재", ja: "盆栽" },
    "plantType.ROSE": { en: "Rose", ko: "장미", ja: "バラ" },
    "plantType.ORCHID": { en: "Orchid", ko: "난초", ja: "ラン" },

    // Garden Collection
    "garden.dayStreak": { en: "Day Streak", ko: "연속 일수", ja: "連続日数" },
    "garden.bestStreak": { en: "Best Streak", ko: "최고 연속", ja: "最高連続" },
    "garden.harvested": { en: "Harvested", ko: "수확", ja: "収穫" },
    "garden.grown": { en: "grown", ko: "재배", ja: "栽培" },
    "garden.notYetGrown": { en: "Not yet grown", ko: "아직 재배 전", ja: "まだ栽培なし" },
    "garden.unlockProgress": { en: "Unlock Progress", ko: "잠금 해제 진행", ja: "アンロック進捗" },
    "garden.dayStreakUnlock": { en: "day streak", ko: "일 연속", ja: "日連続" },
    "garden.days": { en: "days", ko: "일", ja: "日" },

    // Todo Panel
    "todo.placeholder": { en: "What are you working on?", ko: "무슨 작업을 하시나요?", ja: "何に取り組んでいますか？" },
    "todo.noTasks": { en: "No tasks yet", ko: "아직 할 일이 없어요", ja: "まだタスクがありません" },
    "todo.addPrompt": { en: "Add a task to stay focused", ko: "할 일을 추가하여 집중하세요", ja: "タスクを追加して集中しましょう" },
    "todo.markComplete": { en: "Mark as complete", ko: "완료로 표시", ja: "完了にする" },
    "todo.markIncomplete": { en: "Mark as incomplete", ko: "미완료로 표시", ja: "未完了にする" },
    "todo.pinTask": { en: "Pin as focus task", ko: "집중 과제로 고정", ja: "集中タスクに固定" },
    "todo.unpinTask": { en: "Unpin task", ko: "고정 해제", ja: "固定解除" },
    "todo.removeTask": { en: "Remove task", ko: "할 일 삭제", ja: "タスク削除" },

    // Audio Mixer
    "audio.soundscape": { en: "Soundscape", ko: "사운드스케이프", ja: "サウンドスケープ" },
    "audio.muteAll": { en: "Mute all sounds", ko: "전체 음소거", ja: "全てミュート" },
    "audio.unmuteAll": { en: "Unmute all sounds", ko: "음소거 해제", ja: "ミュート解除" },
    "audio.rain": { en: "Rain", ko: "비", ja: "雨" },
    "audio.fire": { en: "Fire", ko: "불", ja: "焚き火" },
    "audio.cafe": { en: "Cafe", ko: "카페", ja: "カフェ" },
    "audio.stream": { en: "Stream", ko: "시냇물", ja: "小川" },
    "audio.white": { en: "White", ko: "화이트", ja: "ホワイト" },

    // History / Stats Panel
    "stats.title": { en: "Stats & History", ko: "통계 & 기록", ja: "統計 & 履歴" },
    "stats.harvested": { en: "Harvested", ko: "수확", ja: "収穫" },
    "stats.focus": { en: "Focus", ko: "집중", ja: "集中" },
    "stats.streak": { en: "Streak", ko: "연속", ja: "連続" },
    "stats.best": { en: "Best", ko: "최고", ja: "最高" },
    "stats.thisWeek": { en: "This Week", ko: "이번 주", ja: "今週" },
    "stats.activity": { en: "Activity · Last 3 Months", ko: "활동 · 최근 3개월", ja: "アクティビティ · 過去3ヶ月" },
    "stats.less": { en: "Less", ko: "적음", ja: "少" },
    "stats.more": { en: "More", ko: "많음", ja: "多" },
    "stats.weeklySummary": { en: "Weekly Summary", ko: "주간 요약", ja: "週間サマリー" },
    "stats.totalThisWeek": { en: "Total this week", ko: "이번 주 합계", ja: "今週の合計" },
    "stats.dailyAverage": { en: "Daily average", ko: "일 평균", ja: "1日平均" },
    "stats.mostFocused": { en: "Most focused", ko: "최다 집중", ja: "最も集中" },
    "stats.vsLastWeek": { en: "vs last week", ko: "지난주 대비", ja: "先週比" },
    "stats.categoryBreakdown": { en: "Category Breakdown", ko: "카테고리별 분석", ja: "カテゴリー内訳" },
    "stats.noHarvests": { en: "No harvests yet", ko: "아직 수확이 없어요", ja: "まだ収穫がありません" },
    "stats.completeSession": { en: "Complete a focus session\nto grow your first plant!", ko: "집중 세션을 완료하여\n첫 식물을 키워보세요!", ja: "集中セッションを完了して\n最初の植物を育てましょう！" },
    "stats.shareCard": { en: "Share focus card", ko: "집중 카드 공유", ja: "集中カードを共有" },
    "stats.exportCsv": { en: "Export data as CSV", ko: "CSV로 내보내기", ja: "CSVでエクスポート" },
    "stats.goal": { en: "goal", ko: "목표", ja: "目標" },

    // Category removal
    "category.removeLabel": { en: "Remove", ko: "삭제", ja: "削除" },
    "category.undoRemove": { en: "removed. Undo?", ko: "삭제됨. 되돌리기?", ja: "削除しました。元に戻す？" },
    "category.undo": { en: "Undo", ko: "되돌리기", ja: "元に戻す" },

    // Undo
    "toast.undo": { en: "Undo", ko: "되돌리기", ja: "元に戻す" },

    // Breathing Guide
    "breathing.inhale": { en: "Breathe in...", ko: "들이쉬세요...", ja: "吸って..." },
    "breathing.hold": { en: "Hold...", ko: "멈추세요...", ja: "止めて..." },
    "breathing.exhale": { en: "Breathe out...", ko: "내쉬세요...", ja: "吐いて..." },
    "breathing.start": { en: "Breathe", ko: "호흡", ja: "呼吸" },

    // Deep Focus
    "deepFocus.badge": { en: "Deep Focus", ko: "딥 포커스", ja: "ディープフォーカス" },
    "toast.deepFocusUnlocked": { en: "New plant unlocked:", ko: "새 식물 잠금 해제:", ja: "新しい植物がアンロック:" },

    // Plant types — new
    "plantType.LOTUS": { en: "Lotus", ko: "연꽃", ja: "ハス" },
    "plantType.CRYSTAL": { en: "Crystal", ko: "크리스탈", ja: "クリスタル" },
    "plantType.BAMBOO": { en: "Bamboo", ko: "대나무", ja: "竹" },
    "plantType.SAKURA": { en: "Sakura", ko: "벚꽃", ja: "桜" },

    // Pro tier
    "pro.badge": { en: "PRO", ko: "PRO", ja: "PRO" },
    "pro.upgrade": { en: "Upgrade to Pro", ko: "Pro로 업그레이드", ja: "Proにアップグレード" },
    "pro.comingSoon": { en: "Coming Soon", ko: "곧 출시", ja: "近日公開" },
    "pro.unlockWith": { en: "Unlock with Pro", ko: "Pro로 잠금 해제", ja: "Proでアンロック" },
    "pro.customCategoryLimit": { en: "Pro unlocks unlimited categories", ko: "Pro로 무제한 카테고리 사용", ja: "Proで無制限カテゴリー" },
    "pro.fullExport": { en: "Export all data with Pro", ko: "Pro로 전체 데이터 내보내기", ja: "Proで全データエクスポート" },
    "pro.joinWaitlist": { en: "Join Waitlist", ko: "대기 목록 참여", ja: "ウェイトリストに参加" },
    "pro.annualSave": { en: "or $39.99/yr (save 33%)", ko: "또는 $39.99/년 (33% 할인)", ja: "または $39.99/年 (33%オフ)" },
    "pro.featurePlants": { en: "8+ rare plant types to collect", ko: "8종 이상 희귀 식물 수집", ja: "8種以上のレア植物を収集" },
    "pro.featureSounds": { en: "15+ ambient sounds library", ko: "15종 이상 앰비언트 사운드", ja: "15種以上のアンビエントサウンド" },
    "pro.featureCategories": { en: "Unlimited custom categories", ko: "무제한 커스텀 카테고리", ja: "無制限のカスタムカテゴリー" },
    "pro.featureStats": { en: "Advanced stats & full CSV export", ko: "고급 통계 & 전체 CSV 내보내기", ja: "高度な統計 & 全CSVエクスポート" },
    "pro.featureThemes": { en: "Custom share card themes", ko: "커스텀 공유 카드 테마", ja: "カスタム共有カードテーマ" },
    "pro.freePlan": { en: "Free", ko: "무료", ja: "無料" },
    "pro.proPlan": { en: "Pro", ko: "Pro", ja: "Pro" },
    "pro.exportLimit": { en: "Free plan: last 7 days only", ko: "무료 플랜: 최근 7일만", ja: "無料プラン：過去7日のみ" },

    // Tour Guide
    "tour.step1Title": { en: "My Garden", ko: "나의 정원", ja: "マイガーデン" },
    "tour.step1Desc": { en: "Your plant grows as you focus. Complete a session to harvest it!", ko: "집중하면 식물이 자라요. 세션을 완료하면 수확할 수 있어요!", ja: "集中すると植物が育ちます。セッションを完了して収穫しましょう！" },
    "tour.step2Title": { en: "Focus Timer", ko: "집중 타이머", ja: "集中タイマー" },
    "tour.step2Desc": { en: "Start a Pomodoro session. The timer keeps running even if you switch tabs.", ko: "뽀모도로 세션을 시작하세요. 탭을 전환해도 타이머는 계속 작동해요.", ja: "ポモドーロセッションを開始。タブを切り替えてもタイマーは動き続けます。" },
    "tour.step3Title": { en: "Timer Modes", ko: "타이머 모드", ja: "タイマーモード" },
    "tour.step3Desc": { en: "Switch between Focus, Short Break, and Long Break modes.", ko: "집중, 짧은 휴식, 긴 휴식 모드를 전환하세요.", ja: "集中、短い休憩、長い休憩モードを切り替えましょう。" },
    "tour.step4Title": { en: "Categories", ko: "카테고리", ja: "カテゴリー" },
    "tour.step4Desc": { en: "Tag your sessions with categories to track what you focus on.", ko: "세션에 카테고리를 태그하여 집중 내역을 추적하세요.", ja: "セッションにカテゴリーをタグ付けして集中内容を追跡しましょう。" },
    "tour.step5Title": { en: "Ambient Sounds", ko: "앰비언트 사운드", ja: "環境音" },
    "tour.step5Desc": { en: "Mix rain, fire, cafe, and more to create your perfect focus atmosphere.", ko: "비, 불, 카페 등의 소리를 믹스하여 완벽한 집중 분위기를 만드세요.", ja: "雨、火、カフェなどの音をミックスして完璧な集中環境を作りましょう。" },
    "tour.step6Title": { en: "Quick Access", ko: "빠른 접근", ja: "クイックアクセス" },
    "tour.step6Desc": { en: "Access settings, to-do list, garden collection, and stats from here.", ko: "설정, 할 일 목록, 정원 컬렉션, 통계에 빠르게 접근하세요.", ja: "設定、タスクリスト、ガーデンコレクション、統計にここからアクセス。" },
    "tour.step7Title": { en: "Keyboard Shortcuts", ko: "키보드 단축키", ja: "キーボードショートカット" },
    "tour.step7Desc": { en: "Press ? to view all keyboard shortcuts for quick control.", ko: "?를 눌러 모든 키보드 단축키를 확인하세요.", ja: "?キーを押してすべてのキーボードショートカットを確認しましょう。" },
    "tour.skip": { en: "Skip", ko: "건너뛰기", ja: "スキップ" },
    "tour.next": { en: "Next", ko: "다음", ja: "次へ" },
    "tour.finish": { en: "Finish", ko: "완료", ja: "完了" },
    "footer.guide": { en: "Guide", ko: "가이드", ja: "ガイド" },
    "footer.tour": { en: "Tour", ko: "투어", ja: "ツアー" },
    "settings.restartTour": { en: "Restart Tour", ko: "투어 다시보기", ja: "ツアーを再開" },
} as const;

export type TranslationKey = keyof typeof translations;

// ─── Store ────────────────────────────────────────────────

type I18nState = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
};

export const useI18n = create<I18nState>()(
    persist(
        (set) => ({
            locale: (typeof navigator !== "undefined" && navigator.language?.startsWith("ko")
                ? "ko"
                : typeof navigator !== "undefined" && navigator.language?.startsWith("ja")
                  ? "ja"
                  : "en") as Locale,
            setLocale: (locale) => set({ locale }),
        }),
        { name: "focus-valley-locale" }
    )
);

// ─── Hook ─────────────────────────────────────────────────

export function useTranslation() {
    const locale = useI18n((s) => s.locale);

    const t = useCallback((key: TranslationKey): string => {
        const entry = translations[key];
        if (!entry) return key;
        return entry[locale] ?? entry.en;
    }, [locale]);

    return { t, locale };
}
