<template>
  <div v-if="pending" class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="animate-pulse space-y-4 w-full max-w-md px-6">
      <div class="h-6 bg-slate-200 rounded w-1/2 mx-auto" />
      <div class="h-40 bg-slate-200 rounded-2xl" />
    </div>
  </div>

  <div v-else-if="error" class="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-6">
    <div class="size-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
      <AlertTriangle :size="28" class="text-red-500" />
    </div>
    <h3 class="font-bold text-slate-700 mb-1">{{ $t('learn.player.load_error') }}</h3>
    <p class="text-sm text-slate-400 mb-6">{{ $t('common.error_generic') }}</p>
    <div class="flex items-center gap-3">
      <button
        class="px-5 h-10 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors"
        @click="loadCourse"
      >
        {{ $t('common.retry') }}
      </button>
      <NuxtLink
        :to="localePath('/catalog')"
        class="px-5 h-10 flex items-center rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors"
      >
        {{ $t('common.back') }}
      </NuxtLink>
    </div>
  </div>

  <div v-else-if="course" class="flex flex-col h-screen overflow-hidden bg-slate-50">
    <header class="flex h-14 sm:h-16 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4 md:px-8 z-20 shrink-0">
      <div class="flex items-center gap-3 min-w-0">
        <div class="bg-blue-600 p-1.5 rounded-lg text-white shrink-0">
          <GraduationCap :size="18" />
        </div>
        <div class="min-w-0">
          <h1 class="text-slate-900 text-sm font-bold leading-tight truncate max-w-[240px] md:max-w-sm">{{ course.title }}</h1>
          <p v-if="courseSubtitle" class="text-[11px] text-slate-400 truncate max-w-[240px] md:max-w-sm">{{ courseSubtitle }}</p>
        </div>
      </div>

      <div class="hidden lg:flex flex-col w-64 gap-1 shrink-0">
        <div class="flex justify-between text-xs font-medium text-slate-600">
          <span>{{ $t('learn.player.progress') }}</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div class="h-full bg-primary rounded-full transition-all" :style="{ width: `${progress}%` }" />
        </div>
      </div>

      <div class="flex items-center gap-3 md:gap-4 shrink-0">
        <NuxtLink
          :to="localePath('/courses')"
          class="flex items-center gap-2 rounded-lg h-10 px-3 md:px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors"
        >
          <X :size="15" />
          <span class="hidden sm:inline">{{ $t('learn.player.quit') }}</span>
        </NuxtLink>
        <img
          :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'Alex'}`"
          class="size-9 rounded-full border-2 border-primary shrink-0"
          alt="Avatar"
        />
      </div>
    </header>

    <div class="flex flex-col md:flex-row flex-1 overflow-hidden">
      <main class="order-1 md:order-2 flex-1 overflow-y-auto">
        <div class="max-w-[1000px] mx-auto p-4 md:p-8 space-y-6">

          <div
            v-if="lockToast"
            class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 font-medium flex items-start gap-2"
          >
            <Lock :size="16" class="mt-0.5 shrink-0" />
            <span class="flex-1">{{ lockToast }}</span>
            <button class="text-amber-700/70 hover:text-amber-900" @click="lockToast = ''"><X :size="14" /></button>
          </div>
          <div v-if="activeLesson" class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
              <div class="flex items-center gap-3 min-w-0">
                <div class="size-9 flex items-center justify-center rounded-lg shrink-0" :class="LESSON_TYPE_CONFIG[activeLesson.type].bg">
                  <component :is="LESSON_TYPE_CONFIG[activeLesson.type].icon" :size="18" :class="LESSON_TYPE_CONFIG[activeLesson.type].color" />
                </div>
                <div class="min-w-0">
                  <h2 class="font-bold text-slate-900 truncate">{{ activeLesson.title }}</h2>
                  <p class="text-[11px] text-slate-400">{{ LESSON_TYPE_CONFIG[activeLesson.type].label }} • {{ activeLesson.duration || '-' }}</p>
                </div>
              </div>
              <button
                v-if="activeLesson.type !== 'quiz'"
                class="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-bold shrink-0 transition-colors"
                :class="activeLesson.completed
                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                  : 'bg-primary text-white hover:bg-blue-700'"
                :disabled="toggling"
                @click="toggleComplete"
              >
                <CheckCircle2 :size="14" />
                {{ activeLesson.completed ? $t('learn.player.unmark') : (toggling ? $t('learn.player.marking') : $t('learn.player.mark_done')) }}
              </button>
            </div>

            <template v-if="activeLesson.type === 'video'">
              <div class="relative flex items-center justify-center bg-slate-900 aspect-video">
                <template v-if="embedUrl && videoStarted">
                  <iframe :src="embedUrl" class="w-full h-full" allowfullscreen frameborder="0" allow="autoplay; fullscreen" />
                </template>
                <template v-else-if="embedUrl">
                  <img
                    v-if="course.coverImage"
                    :src="course.coverImage"
                    class="absolute inset-0 w-full h-full object-cover opacity-40"
                    alt=""
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <button
                    class="z-10 flex shrink-0 items-center justify-center rounded-full size-20 bg-primary text-white shadow-xl transition hover:scale-110 active:scale-95"
                    @click="videoStarted = true"
                  >
                    <Play :size="34" class="ml-1" fill="currentColor" />
                  </button>
                </template>
                <p v-else class="text-slate-400 text-sm">{{ $t('learn.player.video_unavailable') }}</p>
              </div>
              <div v-if="activeLesson.content" class="rendered-content px-6 pt-6">
                <div v-html="activeLesson.content" />
              </div>
              <div class="h-2" />
            </template>

            <div class="p-6">
              <!-- Texte -->
              <div v-if="activeLesson.type === 'text'" class="rendered-content" v-html="activeLesson.content" />

              <!-- PDF -->
              <template v-else-if="activeLesson.type === 'pdf'">
                <div v-if="activeLesson.url" class="rounded-xl overflow-hidden border border-slate-200 mb-4" style="height: 70vh">
                  <iframe :src="activeLesson.url" class="w-full h-full" />
                </div>
                <a
                  v-if="activeLesson.url"
                  :href="activeLesson.url"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-2 text-primary text-sm font-bold hover:underline"
                >
                  <Download :size="14" />
                  {{ $t('learn.player.open_pdf') }}
                </a>
              </template>

              <!-- Quiz -->
              <div v-else-if="activeLesson.type === 'quiz'" class="space-y-5">
                <div class="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-xs text-amber-800 font-medium">
                  {{ $t('learn.quiz.pass_hint') }}
                </div>

                <div
                  v-for="(question, qIdx) in activeLesson.questions"
                  :key="question.id"
                  class="border border-slate-200 rounded-xl p-4"
                >
                  <p class="text-sm font-bold text-slate-800 mb-3">{{ qIdx + 1 }}. {{ question.text }}</p>
                  <div class="space-y-2">
                    <label
                      v-for="option in question.options"
                      :key="option.id"
                      class="flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors"
                      :class="optionClass(question.id, option.id)"
                    >
                      <input
                        type="radio"
                        :name="`question-${question.id}`"
                        class="accent-primary"
                        :disabled="!!quizResult"
                        :checked="quizAnswers[question.id] === option.id"
                        @change="quizAnswers[question.id] = option.id"
                      />
                      <span class="text-sm">{{ option.text }}</span>
                      <CheckCircle2 v-if="quizResult && isCorrectOption(question.id, option.id)" :size="14" class="text-green-500 ml-auto shrink-0" />
                      <XCircle v-else-if="quizResult && quizAnswers[question.id] === option.id" :size="14" class="text-red-500 ml-auto shrink-0" />
                    </label>
                  </div>
                </div>

                <div v-if="quizResult" class="space-y-4">
                  <div
                    class="rounded-xl p-4 flex items-center justify-between border"
                    :class="quizResult.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'"
                  >
                    <span class="text-sm font-bold" :class="quizResult.passed ? 'text-emerald-800' : 'text-rose-800'">
                      {{ $t('learn.quiz.score', { score: quizResult.percentage }) }}
                      ({{ quizResult.score }}/{{ quizResult.total }})
                      — {{ quizResult.passed ? $t('learn.player.passed') : $t('learn.player.failed_min', { threshold: quizResult.passThreshold || 70 }) }}
                    </span>
                    <button v-if="!quizResult.passed" class="text-xs font-bold text-rose-700 hover:underline" @click="retakeQuiz">
                      {{ $t('learn.quiz.retry') }}
                    </button>
                  </div>

                  <div
                    v-if="!quizResult.passed && quizResult.explanations?.length"
                    class="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-4 space-y-3"
                  >
                    <div class="flex items-center gap-2">
                      <div class="size-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                        <Sparkles :size="15" />
                      </div>
                      <div>
                        <p class="text-sm font-black text-slate-900">{{ $t('learn.player.ai_explaining') }}</p>
                        <p class="text-[11px] text-slate-500">{{ $t('learn.player.review_hint') }}</p>
                      </div>
                    </div>
                    <div
                      v-for="(exp, eIdx) in quizResult.explanations"
                      :key="eIdx"
                      class="rounded-xl border border-indigo-100 bg-white/80 p-3 space-y-1"
                    >
                      <p class="text-xs font-bold text-slate-800">{{ exp.question }}</p>
                      <p class="text-xs text-slate-600 leading-relaxed">{{ exp.explanation }}</p>
                    </div>
                  </div>
                </div>
                <button
                  v-else
                  class="px-5 h-10 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-40"
                  :disabled="!allQuestionsAnswered || submittingQuiz"
                  @click="submitQuiz"
                >
                  {{ submittingQuiz ? $t('learn.quiz.submitting') : $t('learn.quiz.validate') }}
                </button>
              </div>
            </div>

            <!-- Navigation -->
            <div class="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <button
                class="flex items-center gap-2 px-4 h-10 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                :disabled="!previousLesson"
                @click="previousLesson && selectLesson(previousLesson.id)"
              >
                <ChevronLeft :size="15" />
                {{ $t('common.previous') }}
              </button>
              <button
                v-if="nextUnlockedLesson"
                class="flex items-center gap-2 px-5 h-10 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-md shadow-primary/20"
                @click="selectLesson(nextUnlockedLesson.id)"
              >
                {{ $t('common.next') }}
                <ChevronRight :size="15" />
              </button>
              <button
                v-else-if="course.finalQuizUnlocked"
                class="flex items-center gap-2 px-5 h-10 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-150"
                @click="selectFinalQuiz"
              >
                {{ $t('learn.player.take_final') }}
                <Award :size="15" />
              </button>
              <div
                v-else
                class="flex items-center gap-2 px-4 h-10 rounded-lg bg-slate-100 text-slate-400 text-xs font-bold"
              >
                <Lock :size="14" />
                {{ $t('learn.player.locked') }}
              </div>
            </div>
          </div>

          <!-- Quiz Global de validation finale -->
          <div v-if="activeLessonId === 'final-quiz'" class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex items-center gap-3">
              <div class="size-10 bg-indigo-50 flex items-center justify-center rounded-xl text-indigo-600">
                <Award :size="22" />
              </div>
              <div>
                <h2 class="font-extrabold text-slate-900 text-lg">{{ $t('learn.quiz.global_title') }}</h2>
                <p class="text-xs text-slate-400">{{ $t('learn.player.final_hint') }}</p>
              </div>
            </div>

            <!-- Chargement -->
            <div v-if="finalQuizLoading" class="p-12 text-center text-slate-400">
              <div class="animate-spin size-8 border-4 border-slate-200 border-t-primary rounded-full mx-auto mb-3" />
              {{ $t('learn.player.loading_final') }}
            </div>

            <!-- Écran principal du quiz de fin -->
            <div v-else class="p-6 space-y-6">
              
              <!-- Cas sans questions -->
              <div v-if="finalQuizError" class="text-center py-8 space-y-3">
                <p class="text-sm text-rose-600 font-medium">{{ finalQuizError }}</p>
              </div>

              <div v-else-if="finalQuizQuestions.length === 0" class="text-center py-8 space-y-4">
                <p class="text-sm text-slate-500">
                  L’examen final IA n’est pas encore prêt. Réessayez dans un instant.
                </p>
              </div>

              <!-- Questionnaire complet -->
              <div v-else-if="!finalQuizResult" class="space-y-6">
                <div class="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-sm text-indigo-700 font-medium">
                  Examen final généré par l’IA à partir de tous les modules. Score minimal : <strong>70 %</strong>.
                </div>

                <div
                  v-for="(question, qIdx) in finalQuizQuestions"
                  :key="question.id"
                  class="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50/20"
                >
                  <div class="flex items-start justify-between gap-4">
                    <p class="text-sm font-bold text-slate-800">{{ qIdx + 1 }}. {{ question.text }}</p>
                    <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black uppercase shrink-0">
                      {{ question.lessonTitle }}
                    </span>
                  </div>
                  <div class="space-y-2">
                    <label
                      v-for="option in question.options"
                      :key="option.id"
                      class="flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors text-sm"
                      :class="finalQuizAnswers[question.id] === option.id ? 'border-primary bg-primary/5 font-semibold text-primary' : 'border-slate-200 bg-white hover:bg-slate-50'"
                    >
                      <input
                        type="radio"
                        :name="`final-question-${question.id}`"
                        class="accent-primary"
                        :checked="finalQuizAnswers[question.id] === option.id"
                        @change="finalQuizAnswers[question.id] = option.id"
                      />
                      <span>{{ option.text }}</span>
                    </label>
                  </div>
                </div>

                <button
                  class="w-full h-12 bg-primary text-white font-extrabold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-4"
                  :disabled="!allFinalQuestionsAnswered || finalQuizSubmitting"
                  @click="submitFinalQuiz"
                >
                  <Award :size="18" />
                  {{ finalQuizSubmitting ? $t('learn.quiz.submitting') : $t('learn.quiz.validate') }}
                </button>
              </div>

              <!-- Résultats du quiz -->
              <div v-else-if="finalQuizResult" class="space-y-6">
                <!-- Succès -->
                <div v-if="finalQuizResult.success" class="bg-emerald-50 border border-emerald-250 p-6 rounded-2xl text-center space-y-3">
                  <div class="size-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 :size="32" class="fill-white text-emerald-600" />
                  </div>
                  <h3 class="text-lg font-black text-emerald-800">{{ $t('learn.quiz.pass_title') }}</h3>
                  <p class="text-sm text-emerald-600">
                    Vous avez obtenu un score de <strong>{{ finalQuizResult.score }}/{{ finalQuizResult.total }}</strong> ({{ finalQuizResult.percentage }}%). Vous avez officiellement validé ce cours !
                  </p>
                  <button
                    v-if="course.hasCertificate !== false"
                    class="inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold hover:bg-[#152a45] transition-colors shadow-md disabled:opacity-50"
                    :disabled="issuingCertificate"
                    @click="goToCertificate"
                  >
                    <Award :size="16" />
                    {{ issuingCertificate ? $t('certificates.generating') : $t('learn.quiz.get_certificate') }}
                  </button>
                </div>

                <!-- Échec -->
                <div v-else class="space-y-6">
                  <div class="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center space-y-3">
                    <div class="size-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <XCircle :size="32" class="fill-white text-rose-600" />
                    </div>
                    <h3 class="text-lg font-black text-rose-800">{{ $t('learn.quiz.fail_title') }}</h3>
                    <p class="text-sm text-rose-600">
                      Vous avez obtenu un score de <strong>{{ finalQuizResult.score }}/{{ finalQuizResult.total }}</strong> soit <strong>{{ finalQuizResult.percentage }}%</strong>. Un score minimal de <strong>{{ finalQuizResult.passThreshold || 70 }}%</strong> est requis.
                    </p>
                    <button
                      class="px-5 py-2.5 bg-rose-650 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
                      @click="retakeFinalQuiz"
                    >
                      {{ $t('learn.quiz.retry') }}
                    </button>
                  </div>

                  <div
                    v-if="finalQuizResult.explanations?.length"
                    class="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-4 space-y-3"
                  >
                    <div class="flex items-center gap-2">
                      <Sparkles :size="16" class="text-indigo-600" />
                      <p class="text-sm font-black text-slate-900">{{ $t('learn.player.ai_explaining') }}</p>
                    </div>
                    <div
                      v-for="(exp, eIdx) in finalQuizResult.explanations"
                      :key="eIdx"
                      class="rounded-xl border border-indigo-100 bg-white/80 p-3 space-y-1"
                    >
                      <p class="text-xs font-bold text-slate-800">{{ exp.question }}</p>
                      <p class="text-xs text-slate-600 leading-relaxed">{{ exp.explanation }}</p>
                    </div>
                  </div>

                  <!-- Leçons à réviser -->
                  <div v-if="finalQuizResult.lessonsToReview && finalQuizResult.lessonsToReview.length > 0" class="border border-slate-200 rounded-xl p-5 space-y-3.5 bg-white">
                    <h4 class="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                       Vidéo{{ finalQuizResult.lessonsToReview.length > 1 ? 's' : '' }} à revoir pour combler vos lacunes
                    </h4>
                    <p class="text-xs text-slate-500">
                      Des erreurs ont été commises sur certaines notions. Veuillez visionner à nouveau ces leçons :
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        v-for="lToReview in finalQuizResult.lessonsToReview"
                        :key="lToReview.id"
                        class="p-3.5 border border-rose-100 rounded-xl text-left bg-rose-50/20 hover:bg-rose-50 hover:border-rose-300 transition-colors flex items-center gap-3 w-full group"
                        @click="selectLesson(lToReview.id)"
                      >
                        <Play :size="16" class="text-rose-500 fill-rose-550 group-hover:scale-125 transition-transform shrink-0" />
                        <div class="min-w-0 flex-1">
                          <p class="text-xs font-bold text-slate-800 truncate line-clamp-1 gap-1.5">{{ lToReview.title }}</p>
                          <p class="text-[9px] text-slate-400 font-semibold truncate">{{ lToReview.moduleTitle }}</p>
                        </div>
                        <ChevronRight :size="14" class="text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <LearnLessonDiscussion v-if="activeLesson" :lesson-id="activeLesson.id" />

          <LearnCourseReviews :slug="slug" />
        </div>
      </main>

      <!-- Programme du cours -->
      <aside class="order-2 md:order-1 md:w-80 border-t md:border-t-0 md:border-r border-slate-200 bg-white overflow-y-auto flex flex-col shrink-0 max-h-96 md:max-h-none">
        <div class="p-6">
          <h3 class="text-slate-900 text-base font-bold mb-1">{{ $t('learn.player.curriculum') }}</h3>
          <p class="text-slate-400 text-xs mb-6">{{ $t('learn.player.lessons_count', { count: allLessons.length }) }} • {{ totalDurationLabel }}</p>

          <div class="flex flex-col gap-1">
            <template v-for="(module, mIdx) in course.modules" :key="module.id">
              <div class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-4 mb-2 first:mt-0">
                Module {{ String(mIdx + 1).padStart(2, '0') }} · {{ module.title }}
              </div>
              <button
                v-for="lesson in module.lessons"
                :key="lesson.id"
                class="flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all w-full"
                :class="lesson.locked
                  ? 'opacity-55 cursor-not-allowed border border-transparent'
                  : lesson.id === activeLessonId
                    ? 'bg-primary/10 border border-primary/20 text-primary'
                    : 'hover:bg-slate-50 border border-transparent'"
                :title="lesson.locked ? lesson.lockReason : ''"
                @click="selectLesson(lesson.id)"
              >
                <Lock v-if="lesson.locked" :size="18" class="text-slate-300 shrink-0" />
                <CheckCircle2 v-else-if="lesson.completed" :size="18" class="text-green-500 shrink-0" />
                <component
                  v-else-if="lesson.id === activeLessonId"
                  :is="LESSON_TYPE_CONFIG[lesson.type].icon"
                  :size="18"
                  class="text-primary shrink-0"
                />
                <Circle v-else :size="18" class="text-slate-300 shrink-0" />
                <span
                  class="text-sm truncate flex-1"
                  :class="lesson.id === activeLessonId && !lesson.locked ? 'font-bold text-primary' : 'font-medium text-slate-600'"
                >
                  {{ lesson.title }}
                </span>
              </button>
            </template>

            <!-- Bouton pour le Quiz Global de Fin -->
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2">
              Validation finale
            </div>
            <button
              class="flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all border w-full"
              :class="!course.finalQuizUnlocked
                ? 'opacity-55 cursor-not-allowed border-transparent text-slate-400'
                : activeLessonId === 'final-quiz'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : (progress === 100 ? 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50 text-emerald-800' : 'hover:bg-slate-50 border-transparent text-slate-600')"
              :title="course.finalQuizLockReason || ''"
              @click="selectFinalQuiz"
            >
              <Lock v-if="!course.finalQuizUnlocked" :size="18" class="text-slate-300 shrink-0" />
              <Award v-else-if="progress === 100" :size="18" class="text-emerald-600 shrink-0" />
              <Award v-else :size="18" class="text-slate-400 shrink-0" />
              <span class="text-sm truncate flex-1 font-bold">
                {{ progress === 100 ? $t('learn.quiz.pass_title') : $t('learn.quiz.final_ai') }}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ChevronRight, ChevronLeft, CheckCircle2, Circle, XCircle, Download, GraduationCap, X, Play, Award, AlertTriangle, Lock, Sparkles } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { LESSON_TYPE_CONFIG } from '~/utils/lessonTypes'
import { toEmbedUrl } from '~/utils/videoEmbed'
import { parseDurationMinutes, formatDuration } from '~/utils/duration'

definePageMeta({ layout: false })

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const student = useStudentCourse()
const { user } = storeToRefs(useAuthStore())

const slug = route.params.slug

function normalizeLesson(l) {
  return {
    ...l,
    type: l.type.toLowerCase(),
    locked: !!l.locked,
    lockReason: l.lockReason || null,
  }
}

const course = ref(null)
const pending = ref(true)
const error = ref(false)
const progress = ref(0)
const lockToast = ref('')

const activeLessonId = ref(null)
const videoStarted = ref(false)

async function loadCourse() {
  pending.value = true
  error.value = false
  try {
    const data = await student.getCourse(slug)
    course.value = {
      ...data,
      modules: data.modules.map(m => ({ ...m, lessons: m.lessons.map(normalizeLesson) })),
    }
    progress.value = data.progress
    const firstOpen = allLessons.value.find(l => !l.locked && !l.completed)
      ?? allLessons.value.find(l => !l.locked)
      ?? allLessons.value[0]
    activeLessonId.value = firstOpen?.id ?? null
  } catch {
    course.value = null
    error.value = true
  } finally {
    pending.value = false
  }
}

onMounted(loadCourse)

const courseSubtitle = computed(() => {
  const parts = []
  if (course.value?.author) parts.push(`Par ${course.value.author.firstName} ${course.value.author.lastName}`)
  if (course.value?.category?.name) parts.push(course.value.category.name)
  return parts.join(' · ')
})

const allLessons = computed(() => course.value?.modules.flatMap(m => m.lessons) ?? [])

const totalDurationLabel = computed(() => {
  const mins = allLessons.value.reduce((sum, l) => sum + parseDurationMinutes(l.duration), 0)
  return formatDuration(mins)
})

const activeLesson = computed(() => allLessons.value.find(l => l.id === activeLessonId.value) ?? null)

const activeIndex = computed(() => allLessons.value.findIndex(l => l.id === activeLessonId.value))
const previousLesson = computed(() => {
  for (let i = activeIndex.value - 1; i >= 0; i--) {
    if (!allLessons.value[i].locked) return allLessons.value[i]
  }
  return null
})
const nextUnlockedLesson = computed(() => {
  for (let i = activeIndex.value + 1; i < allLessons.value.length; i++) {
    if (!allLessons.value[i].locked) return allLessons.value[i]
  }
  return null
})

const embedUrl = computed(() => activeLesson.value?.type === 'video' ? toEmbedUrl(activeLesson.value.url) : null)

function syncCompletionFromIds(completedIds) {
  const set = new Set(completedIds || [])
  for (const lesson of allLessons.value) {
    lesson.completed = set.has(lesson.id)
  }
}

function applyAccessMap(access) {
  if (!access?.accessByLessonId || !course.value) return
  for (const lesson of allLessons.value) {
    const a = access.accessByLessonId[lesson.id]
    if (!a) continue
    lesson.locked = a.locked
    lesson.lockReason = a.lockReason
  }
  course.value.finalQuizUnlocked = access.finalQuizUnlocked
  course.value.finalQuizLockReason = access.finalQuizLockReason
}

function selectLesson(id) {
  const lesson = allLessons.value.find(l => l.id === id)
  if (lesson?.locked) {
    lockToast.value = lesson.lockReason || t('learn.player.locked_lesson')
    return
  }
  lockToast.value = ''
  activeLessonId.value = id
  videoStarted.value = false
  quizResult.value = null
  quizAnswers.value = {}
  finalQuizResult.value = null
}

const toggling = ref(false)
async function toggleComplete() {
  if (!activeLesson.value || toggling.value || activeLesson.value.locked) return
  toggling.value = true
  try {
    const data = activeLesson.value.completed
      ? await student.uncompleteLesson(activeLesson.value.id)
      : await student.completeLesson(activeLesson.value.id)
    activeLesson.value.completed = data.completed
    progress.value = data.progress
    await refreshAccess()
  } catch (e) {
    lockToast.value = e?.data?.statusMessage || e?.statusMessage || 'Action impossible.'
  } finally {
    toggling.value = false
  }
}

async function refreshAccess() {
  try {
    const data = await student.getCourse(slug)
    course.value = {
      ...data,
      modules: data.modules.map(m => ({ ...m, lessons: m.lessons.map(normalizeLesson) })),
    }
    progress.value = data.progress
  } catch {
    /* ignore */
  }
}

const quizAnswers = ref({})
const quizResult = ref(null)
const submittingQuiz = ref(false)

const allQuestionsAnswered = computed(() =>
  activeLesson.value?.questions?.length > 0 &&
  activeLesson.value.questions.every(q => quizAnswers.value[q.id] != null)
)

function optionClass(questionId, optionId) {
  if (!quizResult.value) {
    return quizAnswers.value[questionId] === optionId ? 'border-primary bg-primary/5' : 'border-slate-200'
  }
  if (isCorrectOption(questionId, optionId)) return 'border-green-400 bg-green-50'
  if (quizAnswers.value[questionId] === optionId) return 'border-red-300 bg-red-50'
  return 'border-slate-200 opacity-60'
}

function isCorrectOption(questionId, optionId) {
  const result = quizResult.value?.results.find(r => r.questionId === questionId)
  return result?.correctOptionId === optionId
}

async function submitQuiz() {
  if (!activeLesson.value || submittingQuiz.value) return
  submittingQuiz.value = true
  try {
    const data = await student.submitQuiz(activeLesson.value.id, quizAnswers.value)
    quizResult.value = data
    activeLesson.value.completed = !!data.passed
    progress.value = data.progress
    if (data.completedLessonIds) syncCompletionFromIds(data.completedLessonIds)
    if (data.access) applyAccessMap(data.access)
    else await refreshAccess()
  } catch (e) {
    lockToast.value = e?.data?.statusMessage || e?.statusMessage || 'Soumission impossible.'
  } finally {
    submittingQuiz.value = false
  }
}

function retakeQuiz() {
  quizResult.value = null
  quizAnswers.value = {}
}

const finalQuizQuestions = ref([])
const finalQuizAnswers = ref({})
const finalQuizResult = ref(null)
const finalQuizLoading = ref(false)
const finalQuizSubmitting = ref(false)
const finalQuizError = ref('')

const allFinalQuestionsAnswered = computed(() =>
  finalQuizQuestions.value.length > 0 &&
  finalQuizQuestions.value.every(q => finalQuizAnswers.value[q.id] != null)
)

async function loadFinalQuiz() {
  finalQuizLoading.value = true
  finalQuizError.value = ''
  try {
    const data = await student.getGlobalQuiz(slug)
    finalQuizQuestions.value = data.questions || []
    finalQuizResult.value = null
    finalQuizAnswers.value = {}
  } catch (err) {
    finalQuizQuestions.value = []
    finalQuizError.value = err?.data?.statusMessage || err?.statusMessage || 'Impossible de charger l’examen final.'
  } finally {
    finalQuizLoading.value = false
  }
}

function selectFinalQuiz() {
  if (!course.value?.finalQuizUnlocked) {
    lockToast.value = course.value?.finalQuizLockReason || t('learn.player.locked_final')
    return
  }
  activeLessonId.value = 'final-quiz'
  videoStarted.value = false
  loadFinalQuiz()
}

async function submitFinalQuiz() {
  if (finalQuizSubmitting.value) return
  finalQuizSubmitting.value = true
  try {
    const data = await student.submitGlobalQuiz(slug, finalQuizAnswers.value)
    finalQuizResult.value = data
    if (data.success) {
      progress.value = 100
    }
  } catch (err) {
    finalQuizError.value = err?.data?.statusMessage || err?.statusMessage || 'Soumission impossible.'
  } finally {
    finalQuizSubmitting.value = false
  }
}

function retakeFinalQuiz() {
  finalQuizResult.value = null
  finalQuizAnswers.value = {}
}

const issuingCertificate = ref(false)
async function goToCertificate() {
  if (issuingCertificate.value) return
  issuingCertificate.value = true
  try {
    const cert = await student.issueCertificate(slug, finalQuizResult.value?.percentage)
    await navigateTo({
      path: localePath('/certificates'),
      query: { code: cert.code },
    })
  } catch (e) {
    lockToast.value = e?.data?.statusMessage || e?.statusMessage || t('learn.player.cert_error')
  } finally {
    issuingCertificate.value = false
  }
}
</script>

<style scoped>
.rendered-content :deep(h1) { font-size: 1.5rem; font-weight: 800; margin: 1rem 0 0.5rem; }
.rendered-content :deep(h2) { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
.rendered-content :deep(h3) { font-size: 1.05rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
.rendered-content :deep(p) { margin: 0.5rem 0; line-height: 1.7; }
.rendered-content :deep(ul) { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
.rendered-content :deep(ol) { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
.rendered-content :deep(a) { color: #135bec; text-decoration: underline; }
.rendered-content :deep(img) { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0; }
.rendered-content :deep(blockquote) { border-left: 3px solid #e7ebf3; padding-left: 1rem; margin: 1rem 0; color: #4c669a; font-style: italic; }
.rendered-content :deep(code) { background: #f8f9fc; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.875rem; font-family: monospace; }
.rendered-content :deep(pre) { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 0.75rem; margin: 1rem 0; overflow-x: auto; }
</style>
