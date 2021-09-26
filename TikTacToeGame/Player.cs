using System;
using System.Collections.Generic;
using TikTacToeGame.Events;
using TikTacToeGame.Events.Status;

namespace TikTacToeGame
{
    public class Player : IPlayer
    {
        private readonly IPlayerConnection _playerConnection;
        private readonly Dictionary<Type, Action<object>> _eventsMappeing;
        private Game _game;
        private Mark _mark;

        public event EventHandler<Move> Moved;

        public event EventHandler<string> ChatMessageSent;

        public event EventHandler<PlayerReady> OnReady;

        public event EventHandler Disconnected;

        public Player(IPlayerConnection playerConnection)
        {
            _eventsMappeing = new Dictionary<Type, Action<object>>()
            {
                { typeof(Move), (o) => Move(o as Move) },
                { typeof(ChatMessage), (o) => ChatMessage(o as ChatMessage) },
                { typeof(PlayerReady), (o) => Ready(o as PlayerReady) }
            };

            _playerConnection = playerConnection;
            _playerConnection.MessageReceived += MessageReceived;
            _playerConnection.Disconnected += OnDisconnected;
        }

        private void OnDisconnected(object sender, EventArgs e)
        {
            _playerConnection.MessageReceived -= MessageReceived;
            _playerConnection.Disconnected -= OnDisconnected;
            Game = null;
            Disconnected?.Invoke(this, e);
        }

        public Mark Mark
        {
            get => _mark;
            set
            {
                _mark = value;
                _playerConnection.SendEvent(EventType.SetMark, new SetMark { Mark = _mark });
            }
        }

        public string Name { get; set; }

        private void MessageReceived(object sender, object eventObject)
        {
            var eventType = eventObject.GetType();
            if (_eventsMappeing.TryGetValue(eventType, out var handler))
            {
                handler(eventObject);
            }
            else
            {
                throw new ArgumentException("Unknown message type");
            }
        }

        private void Move(Move moveEvent)
        {
            Moved?.Invoke(this, moveEvent);
        }

        private void ChatMessage(ChatMessage chatMessage)
        {
            ChatMessageSent?.Invoke(this, chatMessage.Message);
        }

        private void Ready(PlayerReady readyEvent)
        {
            Name = readyEvent.PlayerName;
            OnReady?.Invoke(this, readyEvent);
        }

        public Game Game
        {
            get => _game;
            set
            {
                if (_game != null)
                {
                    Unsubscribe();
                }
                _game = value;
                Subscribe();
            }
        }

        private void GameOnPlayerLeaved(object sender, PlayerLeaved e)
        {
            _playerConnection.SendEvent(EventType.PlayerLeaved, e);
        }

        private void GameOnStutusChangedEvent(object sender, Status e)
        {
            _playerConnection.SendEvent(EventType.Status, e);
        }

        private void GameOnChatMessage(object sender, ChatMessage e)
        {
            _playerConnection.SendEvent(EventType.ChatMessage, e);
        }

        private void GameOnPlayerMoved(object sender, Move e)
        {
            _playerConnection.SendEvent(EventType.Move, e);
        }

        private void GameOnNextMove(object sender, NextMove e)
        {
            _playerConnection.SendEvent(EventType.NextMove, e);
        }

        private void GameOnEnd(object sender, GameResult e)
        {
            _playerConnection.SendEvent(EventType.EndOfGame, e);
        }

        public void SendError(ErrorType errorType, string message)
        {
            _playerConnection.SendEvent(EventType.Error, new ErrorEvent { ErrorType = errorType, Message = message });
        }

        private void Subscribe()
        {
            if (_game != null)
            {
                _game.PlayerMoved += GameOnPlayerMoved;
                _game.NextMove += GameOnNextMove;
                _game.ChatMessageSent += GameOnChatMessage;
                _game.GameStutusChanged += GameOnStutusChangedEvent;
                _game.PlayerLeaved += GameOnPlayerLeaved;
            }
        }

        private void Unsubscribe()
        {
            _game.PlayerMoved -= GameOnPlayerMoved;
            _game.NextMove -= GameOnNextMove;
            _game.ChatMessageSent -= GameOnChatMessage;
            _game.GameStutusChanged -= GameOnStutusChangedEvent;
            _game.PlayerLeaved -= GameOnPlayerLeaved;
        }
    }
}