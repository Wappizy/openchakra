'''
Created on 26 janv. 2021

@author: seb
'''
from alfred.database.db_access import DBAccess
import sys
from alfred.misc.consts import get_items

""" Nombre d'alfred par service dont nombre de professionnels """
class ServicesProReport(object):

    def __init__(self, db_name):
      super()
      self.db=DBAccess(db_name)
      
    def report(self):
      categories = self.db.get_items("categories")
      shops = self.db.get_items("shops")
      pros = [s.alfred for s in shops if 'is_professional' in s and s.is_professional]
      serviceusers=self.db.get_items("serviceusers")
      services=self.db.get_items("services")
      
      total=0
      print("catégorie;service;alfreds;pros")
      for service in services:
        category = next(iter(get_items(categories, service.category)), None)
        if not category:
          raise Exception('{} n''a pas de catégorie'.format(service.label))
        sus = get_items(serviceusers, service._id, 'service')
        sus_pro = [su for su in sus if su.user in pros]
        total+=len(sus)
        print("{};{};{};{}".format(category.label, service.label, len(sus), len(sus_pro)))

if __name__ == '__main__':
    ServicesProReport(sys.argv[1]).report()