"""Catalog callables delegate to server policy enforcement with explicit context."""
from contextvars import ContextVar
from engine import call
session=ContextVar('hotel_session')
def execute(name,args):return call(session.get(),name,args)
