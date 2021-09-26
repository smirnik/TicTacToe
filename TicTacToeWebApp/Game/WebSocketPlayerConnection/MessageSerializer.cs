using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using TikTacToeGame.Events;

namespace TicTacToeWebApp.Game.WebSocketPlayerConnection
{
    public class MessageSerializer : IMessageSerializer
    {
        private static readonly JsonSerializerOptions _options;

        private static readonly Dictionary<EventType, Type> eventTypesMapping = new()
        {
            { EventType.Move, typeof(Move) },
            { EventType.ChatMessage, typeof(ChatMessage) },
            { EventType.PlayerReady, typeof(PlayerReady) }
        };

        static MessageSerializer()
        {
            _options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
            _options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        }

        public object Deserialize(string message)
        {
            var textEvent = JsonSerializer.Deserialize<TextEvent>(message, _options);
            if (eventTypesMapping.TryGetValue(textEvent.EventType, out var type))
            {
                return JsonSerializer.Deserialize(textEvent.EventData, type, _options);
            }
            else
            {
                throw new ArgumentException("Unknown message type");
            }
        }

        public string Serialize(EventType eventType, object eventObject)
        {
            var textEvent = new TextEvent()
            {
                EventType = eventType,
                EventData = JsonSerializer.Serialize(eventObject, _options)
            };

            return JsonSerializer.Serialize(textEvent, _options);
        }
    }
}
