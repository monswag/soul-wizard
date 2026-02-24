import type { ArchetypeKey } from '../core/archetypes'

export type Translation = {
  intro: {
    title:             string
    subtitle:          string
    button:            string
    returningTitle:    string
    returningSubtitle: string
    returningButton:   string
    editButton:        string
  }
  userInfo: {
    title:            string
    subtitle:         string
    namePlaceholder:  string
    timezoneLabel:    string
    cityPlaceholder:  (tz: string) => string
    back:             string
    next:             string
  }
  quiz: {
    hint:      string
    questions: Array<{ q: string; options: string[] }>
    back:      string
  }
  reveal: {
    sliders: Array<{ left: string; right: string }>   // [communication, feedback, boundary]
    styleNotes: Record<string, string>                // key: "comm.feed.bnd"
    styleTags: {
      partner: string; advisor: string
      gentle:  string; direct:  string
      soft:    string; private: string; always: string
    }
    retake:  string
    confirm: string
  }
  seal: {
    title:                string
    namePlaceholder:      string
    emojiLabel:           string
    emojiCustomPlaceholder: string
    beingLabel:           string
    beingDisplayNames:    Record<string, string>
    beingCustomPlaceholder: string
    traitsLabel:          string
    traitsOptional:       string
    traitsPlaceholder:    string
    avatarLabel:          string
    avatarQuestion:       string
    skip:                 string
    generate:             string
    copyPrompt:           string
    copied:               string
    overwriteWarning:     string
    back:                 string
    confirm:              string
  }
  success: {
    title:    (name: string) => string
    subtitle: string
    exit:     string
  }
  archetypes: Record<ArchetypeKey, {
    name:        string
    subtitle:    string
    description: string
    tags:        string[]
  }>
}
