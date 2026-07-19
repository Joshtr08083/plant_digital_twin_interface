import json
from channels.generic.websocket import AsyncWebsocketConsumer

class LiveReadingsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("live_readings", self.channel_name)
        await self.accept()
    
    async def disconnect(self, code):
        await self.channel_layer.group_discard("live_readings", self.channel_name)
    
    async def send_reading(self, event):
        await self.send(text_data=json.dumps(event["reading"]))