import { createClient } from '@/lib/supabase/server'

export async function trackMetric(
    userId: string,
    familyId: string | null,
    metricType: string,
    metricData?: any
) {
    try {
        const supabase = await createClient()

        await supabase.from('usage_metrics').insert({
            user_id: userId,
            family_id: familyId,
            metric_type: metricType,
            metric_data: metricData || {}
        })
    } catch (error) {
        console.error('Error tracking metric:', error)
        // Não falhar a operação principal se o tracking falhar
    }
}
