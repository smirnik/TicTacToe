using System.Linq;

namespace TikTacToeGame
{
    public class GameRulesChecker : IGameRulesChecker
    {
        static private readonly int[][] _croccess = new int[][]
        {
            new int[] { 0, 4, 8 },
            new int[] { 2, 4, 6 }
        };

        public GameResult CheckGrid(Mark[] grid, Mark mark)
        {
            int[] winningCells = null;
            bool isDraw = false;

            winningCells = CheckRows(grid, mark);
            if (winningCells == null)
            {
                winningCells = CheckColumns(grid, mark);
            }

            if (winningCells == null)
            {
                winningCells = CheckCrosses(grid, mark);
            }

            if (winningCells == null)
            {
                isDraw = grid.All(cell => cell != Mark.Nothing);
                return new GameResult(isDraw);
            }
            else
            {
                return new GameResult(winningCells, mark);
            }
        }

        static private int[] CheckRows(Mark[] grid, Mark mark)
        {
            int[] winningCells = new int[3];
            for (byte row = 0; row < 3; row++)
            {
                bool isWin = true;
                for (byte column = 0; column < 3; column++)
                {
                    byte cell = (byte)(row * 3 + column);
                    if (grid[cell] != mark)
                    {
                        isWin = false;
                        break;
                    }
                    winningCells[column] = cell;
                }
                if (isWin)
                {
                    return winningCells;
                }
            }

            return null;
        }

        static private int[] CheckColumns(Mark[] grid, Mark mark)
        {
            int[] winningCells = new int[3];
            for (byte column = 0; column < 3; column++)
            {
                bool isWin = true;
                for (byte row = 0; row < 3; row++)
                {
                    byte cell = (byte)(row * 3 + column);
                    if (grid[cell] != mark)
                    {
                        isWin = false;
                        break;
                    }
                    winningCells[row] = cell;
                }
                if (isWin)
                {
                    return winningCells;
                }
            }

            return null;
        }

        static private int[] CheckCrosses(Mark[] grid, Mark mark)
        {
            return _croccess.FirstOrDefault(cross => cross.All(cell => grid[cell] == mark));
        }
    }
}