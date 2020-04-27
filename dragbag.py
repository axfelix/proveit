import sys
import os
import bagit
from time import strftime
from zipfile import ZipFile
import tempfile
import zerorpc

bag_path = None
bag = None
tempdir = None

class DragBag(object):
    def bag_load(self, bag_path):
        tempdir = tempfile.TemporaryDirectory()
        ZipFile(bag_path).extractall(path=tempdir.name)
        try:
            bag = bagit.Bag(path=tempdir.name)
        except:
            return False, False

        if bag.is_valid():
            bag_files = []
            for x in bag.payload_files(): bag_files.append(x)
            return bag_files, bag.info
        else:
            return False, False

    def bag_update(self, new_metadata):
        for x, y in new_metadata:
            bag.info[x] = y
        bag.save(manifests=True)
        desktopPath = os.path.expanduser("~/Desktop/")
        bag_destination = os.path.join(desktopPath, os.path.basename(bag_path))
        zipname = shutil.make_archive(bag_destination, 'zip', bag_path)

    def teardown(self):
        tempdir.cleanup()

if __name__ == '__main__':
    s = zerorpc.Server(DragBag())
    s.bind('tcp://127.0.0.1:' + str(sys.argv[1]))
    s.run()