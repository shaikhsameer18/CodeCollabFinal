export interface GitHubUser {
    login: string;
    avatar_url: string;
    name: string;
    public_repos: number;
    html_url: string;
    bio?: string;
    email?: string;
}

export interface GitHubRepo {
    name: string;
    description: string;
    html_url: string;
    private: boolean;
    created_at: string;
    updated_at: string;
    language: string;
}

export interface CreateRepoParams {
    name: string;
    description?: string;
    private?: boolean;
    auto_init?: boolean;
} 