export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          device_id: string;
          username: string;
          xp: number;
          avatar_color: string;
          created_at: string;
          last_seen_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at" | "last_seen_at"> & {
          id?: string;
          created_at?: string;
          last_seen_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      puzzles: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_url: string;
          thumbnail_url: string | null;
          difficulty: string;
          tile_count: number;
          active: boolean;
          featured: boolean;
          play_count: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["puzzles"]["Row"], "id" | "created_at" | "tile_count"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["puzzles"]["Insert"]>;
      };
      puzzle_attempts: {
        Row: {
          id: string;
          user_id: string;
          puzzle_id: string;
          difficulty: string;
          completion_time_ms: number;
          move_count: number;
          hints_used: number;
          completed: boolean;
          score: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["puzzle_attempts"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["puzzle_attempts"]["Insert"]>;
      };
      leaderboard_entries: {
        Row: {
          id: string;
          user_id: string;
          puzzle_id: string;
          difficulty: string;
          best_time_ms: number;
          score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["leaderboard_entries"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leaderboard_entries"]["Insert"]>;
      };
    };
    Functions: {
      increment_xp: {
        Args: { user_id: string; amount: number };
        Returns: number;
      };
    };
  };
}
