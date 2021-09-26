namespace TikTacToeGame.Events
{
    public class ErrorEvent
    {
        public ErrorType ErrorType { get; set; }
        public string Message { get; set; }
    }
}