namespace TikTacToeGame.Events.Status
{
    public class GameAborted
    {
        public GameAbortedReson Reason;
        public string Details { get; set; }
    }
}