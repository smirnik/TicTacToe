namespace TikTacToeGame
{
    public class GameResult
    {
        public bool IsDraw { get; private set; }

        public Mark Winner { get; private set; }

        public int[] WinningCells { get; private set; }

        public GameResult(int[] winningCells, Mark winner)
        {
            WinningCells = winningCells;
            Winner = winner;
        }

        public GameResult(bool isDraw)
        {
            IsDraw = isDraw;
        }
    }
}