import { ref, computed, type Ref } from 'vue'
import type { Skill } from '~/types'

export function useSkillFilter(skills: Ref<Skill[]>) {
  const searchQuery = ref('')
  const selectedCategory = ref('')

  const categories = computed(() => {
    const cats = new Set(skills.value.map((s) => s.metadata.category))
    return Array.from(cats).filter((c) => c)
  })

  const filteredSkills = computed(() => {
    return skills.value.filter((skill) => {
      const matchesQuery =
        !searchQuery.value ||
        skill.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (Array.isArray(skill.metadata.tags) &&
          skill.metadata.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.value.toLowerCase())
          ))

      const matchesCategory =
        !selectedCategory.value || skill.metadata.category === selectedCategory.value

      return matchesQuery && matchesCategory
    })
  })

  function handleSearch(): void {
    // Trigger computed re-evaluation via ref updates
  }

  function clearSearch(): void {
    searchQuery.value = ''
    selectedCategory.value = ''
  }

  return {
    searchQuery,
    selectedCategory,
    categories,
    filteredSkills,
    handleSearch,
    clearSearch,
  }
}
