import {SupabaseClient} from "@supabase/supabase-js";
import {Database} from "@/types/database";

export enum ClientType {
    SERVER = 'server',
    SPA = 'spa'
}

export class SassClient {
    private client: SupabaseClient<Database>;
    private clientType: ClientType;

    constructor(client: SupabaseClient, clientType: ClientType) {
        this.client = client;
        this.clientType = clientType;

    }

    async loginEmail(email: string, password: string) {
        return this.client.auth.signInWithPassword({
            email: email,
            password: password
        });
    }

    async registerEmail(email: string, password: string) {
        return this.client.auth.signUp({
            email: email,
            password: password
        });
    }

    async exchangeCodeForSession(code: string) {
        return this.client.auth.exchangeCodeForSession(code);
    }

    async resendVerificationEmail(email: string) {
        return this.client.auth.resend({
            email: email,
            type: 'signup'
        })
    }

    async logout() {
        const { error } = await this.client.auth.signOut({
            scope: 'local',
        });
        if (error) throw error;
        if(this.clientType === ClientType.SPA) {
            window.location.href = '/auth/login';
        }
    }

    async uploadFile(myId: string, filename: string, file: File) {
        filename = filename.replace(/[^0-9a-zA-Z!\-_.*'()]/g, '_');
        filename = myId + "/" + filename
        return this.client.storage.from('files').upload(filename, file);
    }

    async getFiles(myId: string) {
        return this.client.storage.from('files').list(myId)
    }

    async deleteFile(myId: string, filename: string) {
        filename = myId + "/" + filename
        return this.client.storage.from('files').remove([filename])
    }

    async shareFile(myId: string, filename: string, timeInSec: number, forDownload: boolean = false) {
        filename = myId + "/" + filename
        return this.client.storage.from('files').createSignedUrl(filename, timeInSec, {
            download: forDownload
        });

    }

    async getUserMeetingsFull(userId: string='') {
        let query = this.client
        .from("meetings")
        .select(`
        id,
        title,
        description,
        date,
        duration,
        status,
        created_at,
        updated_at,

        projects (
            id,
            name,
            description,
            color,
            created_at,
            updated_at,
            tasks (
            id,
            title,
            description,
            status,
            order_index,
            created_at,
            updated_at
            )
        ),

        meeting_notes (
            id,
            content,
            created_at,
            updated_at
        ),

        report_settings (
            id,
            style,
            additional_prompt,
            created_at,
            updated_at
        ),

        generated_reports (
            id,
            content,
            file_path,
            created_at
        )
        `)
        .eq("user_id", userId)
        .order('date', { ascending: false })

        return query
    }

    async createMeeting(row: Database["public"]["Tables"]["meetings"]["Insert"]) {
        const result = await this.client.from('meetings').insert(row).select().single()
        if (result.data) {
            await this.client.from('report_settings').insert({
                meeting_id: result.data.id,
                style: 'executive',
                additional_prompt: ''
            })
            await this.client.from('meeting_notes').insert({
                meeting_id: result.data.id,
                content: ''
            })
        }
        return result
    }

    async updateMeeting(id: string, row: Database["public"]["Tables"]["meetings"]["Update"]) {
        return this.client.from('meetings').update(row).eq('id', id)
    }

    async deleteMeeting(id: string) {
        return this.client.from('meetings').delete().eq('id', id)
    }

    async createProject(row: Database["public"]["Tables"]["projects"]["Insert"]) {
        return this.client.from('projects').insert(row).select().single()
    }

    async updateProject(id: string, row: Database["public"]["Tables"]["projects"]["Update"]) {
        return this.client.from('projects').update(row).eq('id', id)
    }

    async deleteProject(id: string) {
        return this.client.from('projects').delete().eq('id', id)
    }

    async createTask(row: Database["public"]["Tables"]["tasks"]["Insert"]) {
        return this.client.from('tasks').insert(row).select().single()
    }

    async updateTask(id: string, row: Database["public"]["Tables"]["tasks"]["Update"]) {
        return this.client.from('tasks').update(row).eq('id', id)
    }

    async deleteTask(id: string) {
        return this.client.from('tasks').delete().eq('id', id)
    }

    async updateMeetingNotes(meetingId: string, content: string) {
        const { data, error } = await this.client
            .from('meeting_notes')
            .select('id')
            .eq('meeting_id', meetingId)
            .maybeSingle()

        if (data) {
            return this.client.from('meeting_notes').update({ content }).eq('meeting_id', meetingId)
        } else {
            return this.client.from('meeting_notes').insert({ meeting_id: meetingId, content })
        }
    }

    async updateReportSettings(meetingId: string, style: string, additionalPrompt: string) {
        const { data, error } = await this.client
            .from('report_settings')
            .select('id')
            .eq('meeting_id', meetingId)
            .maybeSingle()

        if (data) {
            return this.client.from('report_settings').update({ style, additional_prompt: additionalPrompt }).eq('meeting_id', meetingId)
        } else {
            return this.client.from('report_settings').insert({ meeting_id: meetingId, style, additional_prompt: additionalPrompt })
        }
    }

    async saveGeneratedReport(meetingId: string, content: string, filePath: string) {
        const { data, error } = await this.client
            .from('generated_reports')
            .select('id')
            .eq('meeting_id', meetingId)
            .maybeSingle()

        if (data) {
            return this.client.from('generated_reports').update({ content, file_path: filePath }).eq('meeting_id', meetingId)
        } else {
            return this.client.from('generated_reports').insert({ meeting_id: meetingId, content, file_path: filePath })
        }
    }

    async getGeneratedReport(meetingId: string) {
        return this.client
            .from('generated_reports')
            .select('*')
            .eq('meeting_id', meetingId)
            .maybeSingle()
    }

    async getMyTodoList(page: number = 1, pageSize: number = 100, order: string = 'created_at', done: boolean | null = false) {
        let query = this.client.from('todo_list').select('*').range(page * pageSize - pageSize, page * pageSize - 1).order(order)
        if (done !== null) {
            query = query.eq('done', done)
        }
        return query
    }

    async createTodoTask(row: Database["public"]["Tables"]["todo_list"]["Insert"]) {
        return this.client.from('todo_list').insert(row)
    }

    async removeTodoTask (id: number) {
        return this.client.from('todo_list').delete().eq('id', id)
    }

    async updateAsDone (id: number) {
        return this.client.from('todo_list').update({done: true}).eq('id', id)
    }

    async updateUserSubscription(stripeCustomerId: string, subscriptionData: {
        subscription_status: string,
        subscription_plan_id: string | null,
        stripe_subscription_id: string | null
    }) {
        return this.client
            .from('profiles')
            .update(subscriptionData)
            .eq('stripe_customer_id', stripeCustomerId);
    }

    async getUserSubscription(stripeCustomerId: string) {
        return this.client
            .from('profiles')
            .select('id, subscription_status, subscription_plan_id, stripe_subscription_id')
            .eq('stripe_customer_id', stripeCustomerId)
            .maybeSingle();
    }

    getSupabaseClient() {
        return this.client;
    }


}
