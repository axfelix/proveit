"""
GUI tool to create a Bag from a filesystem folder.
"""

import sys
import os
import bagit
from time import strftime
from zipfile import ZipFile
import tempfile
import zerorpc

class DragBag(object):
    def bag_load(self, bag):
        tempdir = tempfile.TemporaryDirectory()
        ZipFile(bag).extractall(path=tempdir.name)
        bag = bagit.Bag(path=tempdir.name)

        bag.info
        for x in bag.payload_files(): print(x)
        bag.save(manifests=True)
        bag.validate()
        tempdir.cleanup()

if __name__ == '__main__':
    s = zerorpc.Server(DragBag())
    s.bind('tcp://127.0.0.1:' + str(sys.argv[1]))
    s.run()